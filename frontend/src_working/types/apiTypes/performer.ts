// Performer types matching backend schemas

export enum PerformerStatus {
    WAITING = "waiting",
    PERFORMING = "performing",
    COMPLETED = "completed",
    SKIPPED = "skipped"
}

export interface Performer {
    performer_id: number;
    performer_name: string;
    performer_username: string;
    queue_number: number;
    status: PerformerStatus;
    session_id: number;
}

export interface PerformerCreate {
    performer_name: string;
    performer_username?: string;
    queue_number: number;
    status: PerformerStatus;
    session_id: number;
}

export interface PerformerUpdate {
    performer_name?: string;
    performer_username?: string;
    queue_number?: number;
    status?: PerformerStatus;
}
