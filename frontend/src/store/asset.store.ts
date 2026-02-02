import { create } from "zustand";
import type { Asset } from "../types/asset.type";

interface AssetStoreState {
    currentAsset: Asset | null;
}

interface AssetStoreActions {
    setCurrentAsset: (asset: Asset | null) => void;
    clearCurrentAsset: () => void;
}

type AssetStore = AssetStoreState & AssetStoreActions;

const useAssetStore = create<AssetStore>((set) => ({
    currentAsset: null,
    setCurrentAsset: (asset) => set({ currentAsset: asset }),
    clearCurrentAsset: () => set({ currentAsset: null }),
}));

export default useAssetStore;
