import React, { useEffect, useState, useCallback, useRef } from "react";
import VRCoreIframeBlock from "../block/VRCoreIframeBlock";
import ControlBlock from "../block/ControlBlock";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import use3DVistaHook from "@/hooks/use3DVistaHook";
import useVRStore from "@/store/vr.store";
import useAssetStore from "@/store/asset.store";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import "./VRPage.module.css";
import { useSearchParams } from "react-router-dom";
import { Drawer } from "vaul";
import AssetDrawerBlock from "../block/AssetDrawerBlock";


const TAG = "[VRPage]";
const log = (...args: any[]) => console.log(TAG, ...args);

const VRPage = () => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const {
    showMedia,
    onMessage: registerMessageHandler,
    muteAllAudio,
    unmuteAllAudio,
    getAudioState,
  } = use3DVistaHook({
    ref: iframeRef as React.RefObject<HTMLIFrameElement>,
  });

  const {
    isLoading,
    currentHotspot,
    currentPanorama,
    getHotspotById,
    setCurrentHotspotById,
    setPanoramasByHotspotId,
    setCurrentPanorama,
    getPanoramaById,
  } = useVRStore((state) => state);

  const { currentAsset, setCurrentAsset } = useAssetStore((state) => state);
  const [searchParams] = useSearchParams();

  // ── Refs for stable access in callbacks ──
  const getPanoramaByIdRef = useRef(getPanoramaById);
  const setCurrentHotspotByIdRef = useRef(setCurrentHotspotById);
  const setCurrentPanoramaRef = useRef(setCurrentPanorama);
  const currentHotspotRef = useRef(currentHotspot);

  useEffect(() => { getPanoramaByIdRef.current = getPanoramaById; }, [getPanoramaById]);
  useEffect(() => { setCurrentHotspotByIdRef.current = setCurrentHotspotById; }, [setCurrentHotspotById]);
  useEffect(() => { setCurrentPanoramaRef.current = setCurrentPanorama; }, [setCurrentPanorama]);
  useEffect(() => { currentHotspotRef.current = currentHotspot; }, [currentHotspot]);

  // ── 1. Handle search params (deep link) ──
  useEffect(() => {
    const hotspot_id = searchParams.get("hotspot_id");
    if (hotspot_id) {
      const hotspot_id_number = Number(hotspot_id);
      const hotspot = getHotspotById(hotspot_id_number);
      if (hotspot?.click_panorama_id) {
        log("Deep link: showing hotspot panorama", hotspot.click_panorama_id);
        showMedia(hotspot.click_panorama_id);
      }
    } else {
      const panorama_id = searchParams.get("panorama_id");
      if (panorama_id) {
        log("Deep link: showing panorama", panorama_id);
        showMedia(panorama_id);
      }
    }
  }, [searchParams, isLoading]);

  // ── 2. Loading fade effect ──
  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      const timer = setTimeout(() => setIsFadingOut(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFadingOut(false);
    }
  }, [isLoading]);

  // ── 3. Fetch panoramas when currentHotspot changes ──
  useEffect(() => {
    (async () => {
      if (currentHotspot) {
        log("Fetching panoramas for hotspot:", currentHotspot.hotspot_id, currentHotspot.title);
        await setPanoramasByHotspotId(currentHotspot.hotspot_id);
        log("Panoramas loaded for hotspot:", currentHotspot.hotspot_id);
      }
    })();
  }, [currentHotspot]);

  // ── 4. Handle panorama_change from 3DVista iframe ──
  const handlePanoramaChange = useCallback(async (panoramaInfo: any) => {
    const panoramaId = panoramaInfo?.data?.label;
    if (!panoramaId) {
      log("panorama_change: no panorama label in payload", panoramaInfo);
      return;
    }

    log("panorama_change received:", panoramaId);

    try {
      // Use refs to avoid stale closures
      const panorama = await getPanoramaByIdRef.current(panoramaId);

      if (!panorama) {
        log("panorama_change: panorama NOT FOUND for id:", panoramaId);
        return;
      }

      log("panorama_change: resolved panorama:", {
        id: panorama.panorama_id,
        title: panorama.title,
        hotspot_id: panorama.hotspot_id,
      });

      // Check if hotspot actually changed
      const prevHotspotId = currentHotspotRef.current?.hotspot_id;
      if (prevHotspotId === panorama.hotspot_id) {
        log("panorama_change: same hotspot, only updating panorama");
        setCurrentPanoramaRef.current(panorama);
        return;
      }

      log(`panorama_change: hotspot CHANGED ${prevHotspotId} → ${panorama.hotspot_id}`);
      setCurrentHotspotByIdRef.current(panorama.hotspot_id);
      setCurrentPanoramaRef.current(panorama);
    } catch (err) {
      log("panorama_change: ERROR", err);
    }
  }, []); // Empty deps — uses refs

  // Register via 3DVista hook message system
  useEffect(() => {
    registerMessageHandler("panorama_change", handlePanoramaChange);
  }, [registerMessageHandler, handlePanoramaChange]);

  // Also register via raw window.addEventListener (fallback — 3DVista may post directly)
  useEffect(() => {
    const handleDirectMessage = (event: MessageEvent) => {
      if (event.data?.type === "panorama_change") {
        log("Direct panorama_change message received via window.addEventListener");
        handlePanoramaChange(event.data.payload);
      }
    };
    window.addEventListener("message", handleDirectMessage);
    return () => window.removeEventListener("message", handleDirectMessage);
  }, [handlePanoramaChange]);

  // ── 5. Debug: log state on every relevant change ──
  useEffect(() => {
    log("State updated:", {
      hotspotId: currentHotspot?.hotspot_id,
      hotspotTitle: currentHotspot?.title,
      panoramaId: currentPanorama?.panorama_id,
      panoramaTitle: currentPanorama?.title,
      bgMusicUrl: (currentHotspot as any)?.metadata?.bg_music_url?.substring(0, 60),
      speechUrl: (currentHotspot as any)?.metadata?.audio_url?.substring(0, 60),
      panoramasCount: useVRStore.getState().panoramas.length,
    });
  }, [currentHotspot, currentPanorama]);

  const assetSnapPoints = ["500px", 1];
  const [assetSnap, setAssetSnap] = useState<number | string | null>(
    assetSnapPoints[0]
  );

  const { cssHeight } = useViewportHeight();
  return (
    <>
      {/* Asset Drawer */}
      <Drawer.Root
        open={!!currentAsset}
        snapPoints={assetSnapPoints}
        activeSnapPoint={assetSnap}
        setActiveSnapPoint={setAssetSnap}
        fadeFromIndex={1}
      >
        <Drawer.Overlay className="z-[9999] fixed inset-0" />
        <Drawer.Portal>
          <Drawer.Content
            data-testid="asset-content"
            className="fixed z-[9999] glass-light !border-white/20 mx-[1px] flex flex-col bg-white border border-gray-200 border-b-none rounded-t-4xl bottom-0 left-0 right-0 h-full mx-[-1px]"
          >
            <AssetDrawerBlock
              currentAsset={currentAsset}
              setCurrentAsset={setCurrentAsset}
              showMedia={showMedia}
              snap={assetSnap}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <div
        className="w-full relative overflow-hidden h-screen-mobile"
        style={{ height: cssHeight }}
      >
        <div className="w-full h-full relative">
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <ControlBlock
                showMedia={showMedia}
                muteAllAudio={muteAllAudio}
                unmuteAllAudio={unmuteAllAudio}
                getAudioState={getAudioState}
              />
            </div>
          </div>
          {(isLoading || isFadingOut) && (
            <div
              className={`fixed top-0 left-0 right-0 bottom-0 bg-black z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
                isFadingOut ? "opacity-0" : "opacity-100"
              }`}
            >
              <Spinner size={64} className="text-primary" variant="default" />
            </div>
          )}
          <div className="w-full h-full relative">
            <VRCoreIframeBlock ref={iframeRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default VRPage;
