// Performer types matching backend schemas

export enum PerformerStatus {
    waiting = "waiting",
    performing = "performing",
    completed = "completed",
    skipped = "skipped"
}

export enum PerformerType {
    individual = "individual",
    group = "group"
}

export interface Performer {
    performer_id: number;
    performer_name: string;
    performer_username: string;
    queue_number: number;
    status: PerformerStatus;
    session_id: number;
    performer_type: PerformerType;
    note?: string;
}

export interface PerformerCreate {
    performer_name: string;
    performer_username?: string;
    queue_number: number;
    status: PerformerStatus;
    session_id: number;
    performer_type?: PerformerType;
    note?: string;
}

export interface PerformerUpdate {
    performer_name?: string;
    performer_username?: string;
    queue_number?: number;
    status?: PerformerStatus;
    performer_type?: PerformerType;
    note?: string;
}
