import { supabase } from "@/lib/supabase"

export const getAreaDetailById = async (area_id: number) => {
    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('area_id', area_id).single()

    if (error) {
        throw new Error('Failed to fetch area: ' + (error as Error).message)
    }
    return data
}

