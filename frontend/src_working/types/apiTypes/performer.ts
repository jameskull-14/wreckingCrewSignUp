// Performer types matching backend schemas

export interface Performer {
    performer_id: number;
    performer_name: string;
    performer_username: string;
    queue_number: number;
    status: string;
    session_id: number;
}

export interface PerformerCreate {
    performer_name: string;
    performer_username?: string;
    queue_number: number;
    status: string;
    session_id: number;
}

export interface PerformerUpdate {
    performer_name?: string;
    performer_username?: string;
    queue_number?: number;
    status?: string;
}
