import { create } from "zustand";
import type { Area } from "../types/area.service.type";
import type { Hotspot } from "../types/hotspots.service.type";
import { CURRENT_AREA_ID } from "@/constants/env.constants";
import { getAreaDetailById } from "@/services/area.service";
import { getHotspotsByAreaId } from "@/services/hotspots.service";
import type { Panorama } from "@/types/panoramas.service.type";
import {
  getPanoramaByIdFromService,
  getPanoramasByHotspotId,
} from "@/services/panoramas.service";

interface VRStoreState {
  currentArea: Area | null;
  currentHotspot: Hotspot | null;
  currentPanorama: Panorama | null;
  areaHotspots: Hotspot[];
  isLoading: boolean;
  panoramas: Panorama[];
  isLoadingPanoramas: boolean;
}

interface VRStoreActions {
  setCurrentArea: (area: Area | null) => void;
  setCurrentHotspot: (hotspot: Hotspot | null) => void;
  setAreaHotspots: (hotspots: Hotspot[]) => void;
  clearVRState: () => void;
  loadData: () => Promise<void>;
  getHotspotById: (hotspot_id: number) => Hotspot | undefined;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentHotspotById: (hotspot_id: number) => void;
  setPanoramasByHotspotId: (hotspot_id: number) => void;
  setCurrentPanorama: (panorama: Panorama | null) => void;
  setCurrentPanoramaById: (panorama_id: string) => void;
  getPanoramaById: (panorama_id: string) => Promise<Panorama | undefined>;
}

type VRStore = VRStoreState & VRStoreActions;

const useVRStore = create<VRStore>((set, get) => ({
  currentArea: null,
  currentHotspot: null,
  currentPanorama: null,
  isLoading: true,
  areaHotspots: [],
  panoramas: [],
  isLoadingPanoramas: false,
  setCurrentArea: (area) => set({ currentArea: area }),
  setCurrentHotspot: (hotspot) => set({ currentHotspot: hotspot }),
  setCurrentPanorama: (panorama) => set({ currentPanorama: panorama }),
  setAreaHotspots: (hotspots) => set({ areaHotspots: hotspots }),
  clearVRState: () =>
    set({
      currentArea: null,
      currentHotspot: null,
      currentPanorama: null,
      areaHotspots: [],
    }),
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading: isLoading });
  },
  setCurrentHotspotById: (hotspot_id: number) => {
    let hotspot = get().getHotspotById(hotspot_id);
    if (hotspot) {
      set({ currentHotspot: hotspot });
    }
  },
  getHotspotById: (hotspot_id: number) => {
    let areaHotspots = get().areaHotspots;
    const hotspot = areaHotspots.find(
      (hotspot) => hotspot.hotspot_id === hotspot_id
    );
    return hotspot;
  },
  loadData: async () => {
    set({ isLoading: true });
    try {
      const currentArea = await getAreaDetailById(CURRENT_AREA_ID);
      const areaHotspots = await getHotspotsByAreaId(CURRENT_AREA_ID);
      const currentHotspot = areaHotspots.find(
        (hotspot) => hotspot.hotspot_id === currentArea.main_hotspot_id
      );
      if (!currentHotspot) {
        throw new Error("Main hotspot not found");
      }
      // add 1000 time out for little delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set({ currentArea, areaHotspots, currentHotspot, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  getPanoramaById: async (panorama_id: string) => {
    let panoramas = get().panoramas;
    let currentPanorama = panoramas.find(
      (panorama) => panorama.panorama_id === panorama_id
    );
    // if you do not find the panorama, try to search in the cloud service
    if (!currentPanorama) {
      currentPanorama = await getPanoramaByIdFromService(panorama_id);
    }
    return currentPanorama;
  },
  setCurrentPanoramaById: (panorama_id: string) => {
    let panoramas = get().panoramas;
    let currentPanorama = panoramas.find(
      (panorama) => panorama.panorama_id === panorama_id
    );
    if (currentPanorama) {
      set({ currentPanorama: currentPanorama });
    }
  },
  setPanoramasByHotspotId: async (hotspot_id: number) => {
    try {
      set({ isLoadingPanoramas: true });
      const hotspot = get().getHotspotById(hotspot_id);
      const currentArea = get().currentArea;
      const areaHotspots = get().areaHotspots;

      if (hotspot) {
        let panoramas: Panorama[] = [];

        // Check if this is the main hotspot of the area
        const isMainHotspot =
          currentArea?.main_hotspot_id !== null &&
          currentArea?.main_hotspot_id !== undefined &&
          Number(currentArea.main_hotspot_id) === hotspot_id;

        if (isMainHotspot) {
          // MAIN HOTSPOT: Get the main panorama from each hotspot related to this area
          // This provides an overview of all hotspots in the area
          const mainPanoramaPromises = areaHotspots.map(async (h) => {
            if (h.click_panorama_id) {
              return await getPanoramaByIdFromService(h.click_panorama_id);
            }
            // If hotspot doesn't have click_panorama_id, get its first panorama
            const hotspotPanoramas = await getPanoramasByHotspotId(
              h.hotspot_id
            );
            return hotspotPanoramas[0];
          });

          const mainPanoramas = await Promise.all(mainPanoramaPromises);
          panoramas = mainPanoramas.filter(
            (p): p is Panorama => p !== undefined
          );
        } else {
          // NOT MAIN HOTSPOT: Get all panoramas belonging to this specific hotspot
          panoramas = await getPanoramasByHotspotId(hotspot_id);
        }

        set({
          panoramas: panoramas,
        });

        let currentPanorama = panoramas.find(
          (panorama) => panorama.panorama_id === hotspot.click_panorama_id
        );
        if (currentPanorama) {
          set({
            currentPanorama: currentPanorama,
          });
        }
        set({ isLoadingPanoramas: false });
      }
    } catch (error) {
      set({ isLoadingPanoramas: false });
      throw error;
    }
  },
}));

export default useVRStore;
