import { supabase } from '@/lib/supabase'

export const getHotspotsByAreaId = async (area_id: number) => {
  const { data, error } = await supabase
    .from('hotspots')
    .select('*')
    .eq('area_id', area_id)

  if (error) {
    throw new Error('Failed to fetch hotspots: ' + (error as Error).message)
  }
  return data
}