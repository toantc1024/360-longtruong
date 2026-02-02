import { getApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { VisitorLogs } from "@/types/visitor_logs.service.type";

export const createVisitorLog = async (visitorLog: Partial<VisitorLogs>) => {
    const response = await getApi().post("/visitor-logs/add", visitorLog);
    return response.data;
}

export const countVisitorLogsByAreaId = async (area_id: number): Promise<number> => {
    const { count, error } = await supabase
        .from('visitor_logs')
        .select('*', { count: 'exact', head: true })
        .eq('area_id', area_id);
    if (error) {
        throw new Error("Failed to fetch visitor logs: " + (error as Error).message);
    }
    return count || 0;
}