import React, { useEffect, useState } from "react";
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
    getHotspotById,
    setCurrentHotspotById,
    setPanoramasByHotspotId,
    setCurrentPanorama,
    getPanoramaById,
  } = useVRStore((state) => state);
  const { currentAsset, setCurrentAsset } = useAssetStore((state) => state);
  let [searchParams, _] = useSearchParams();

  useEffect(() => {
    let hotspot_id = searchParams.get("hotspot_id");
    if (hotspot_id) {
      let hotspot_id_number = Number(hotspot_id);
      let hotspot = getHotspotById(hotspot_id_number);
      showMedia(hotspot?.click_panorama_id || "");
    } else {
      let panorama_id = searchParams.get("panorama_id");
      if (panorama_id) {
        showMedia(panorama_id || "");
      }
    }
  }, [searchParams, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);

      const timer = setTimeout(() => {
        setIsFadingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsFadingOut(false);
    }
  }, [isLoading]);

  useEffect(() => {
    (async () => {
      if (currentHotspot) {
        await setPanoramasByHotspotId(currentHotspot.hotspot_id);
      }
    })();
  }, [currentHotspot]);
  useEffect(() => {
    const handlePanoramaChange = async (panoramaInfo: any) => {
      const panorama = getPanoramaById(panoramaInfo.data.label);
      if (panorama) {
        const resolvedPanorama = await panorama;
        if (resolvedPanorama) {
          setCurrentHotspotById(resolvedPanorama.hotspot_id);
          setCurrentPanorama(resolvedPanorama);
        }
      }
    };
    registerMessageHandler("panorama_change", handlePanoramaChange);
    const handleDirectMessage = async (event: any) => {
      if (event.data && event.data.type === "panorama_change") {
        const panoramaInfo = event.data.payload;
        await handlePanoramaChange(panoramaInfo);
      }
    };
    window.addEventListener("message", handleDirectMessage);
    return () => {
      window.removeEventListener("message", handleDirectMessage);
    };
  }, [registerMessageHandler]);

  const assetSnapPoints = ["400px", 1];
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
              className={`fixed top-0 left-0 right-0 bottom-0 bg-black  z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${
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
