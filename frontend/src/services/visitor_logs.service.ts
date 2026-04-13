import { supabase } from "@/lib/supabase";
import type { VisitorLogs } from "@/types/visitor_logs.service.type";

export const createVisitorLog = async (visitorLog: Partial<VisitorLogs>) => {
    // Check if session already logged
    const { data: existing } = await supabase
        .from('visitor_logs')
        .select('id')
        .eq('session_id', visitorLog.session_id!)
        .limit(1);

    if (existing && existing.length > 0) {
        return { status: false };
    }

    const { data, error } = await supabase
        .from('visitor_logs')
        .insert({
            area_id: visitorLog.area_id,
            session_id: visitorLog.session_id,
            metadata: visitorLog.metadata,
        })
        .select();

    if (error) {
        throw new Error("Failed to create visitor log: " + error.message);
    }

    return { status: !!data };
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