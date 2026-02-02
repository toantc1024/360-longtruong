import { supabase } from "@/lib/supabase";
import type { Panorama } from "@/types/panoramas.service.type.ts"

export const getPanoramasByHotspotId = async (
    hotspot_id: number | string
): Promise<Panorama[]> => {
    const { data, error } = await supabase
        .from("panoramas")
        .select("*")
        .eq("hotspot_id", hotspot_id);

    if (error) {
        throw new Error("Failed to fetch panoramas: " + (error as Error).message);
    }

    return data || [];
};

export const countPanoramasByHotspotId = async (hotspot_id: number | string): Promise<number> => {
    const { data, error } = await supabase
        .from("panoramas")
        .select("*")
        .eq("hotspot_id", hotspot_id);

    if (error) {
        throw new Error("Failed to fetch panoramas: " + (error as Error).message);
    }

    return data?.length || 0;
}

export const getPanoramaByIdFromService = async (panorama_id: string): Promise<Panorama | undefined> => {
    const { data, error } = await supabase
        .from("panoramas")
        .select("*")
        .eq("panorama_id", panorama_id);

    if (error || !data || data.length === 0) {
        return undefined
    }

    return data[0] as Panorama;
}