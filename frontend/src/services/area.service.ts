import { supabase } from "@/lib/supabase"

export const getAreaDetailById = async (area_id: number) => {
    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('area_id', area_id).single()

    if (error) {
        throw new Error('Failed to fetch area: ' + (error as Error).message)
    }

    // The areas table has no metadata column.
    // Metadata (bg_music_url, nha_co_cong, tuyen_duong) is stored
    // in the main hotspot's metadata JSONB column.
    if (data.main_hotspot_id) {
        const { data: mainHotspot } = await supabase
            .from('hotspots')
            .select('metadata')
            .eq('hotspot_id', data.main_hotspot_id)
            .single()

        if (mainHotspot?.metadata) {
            data.metadata = mainHotspot.metadata
        }
    }

    return data
}
