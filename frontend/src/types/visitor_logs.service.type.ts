export interface VisitorLogs {
    id: string;
    session_id: string;
    area_id: string;
    visited_at: Date;
    metadata: Record<string, any>;
}