// Performer Song Selection types matching backend schemas

export interface PerformerSongSelection {
    performer_selection_id: number;
    performer_id: number;
    song_id: number;
    selection_order: string;
    is_singing: boolean;
    instrument?: string;
    status: string;
    created_at: string;
}

export interface PerformerSongSelectionCreate {
    performer_id: number;
    song_id: number;
    selection_order: string;
    is_singing: boolean;
    instrument?: string;
    status: string;
}

export interface PerformerSongSelectionUpdate {
    selection_order?: string;
    is_singing?: boolean;
    instrument?: string;
    status?: string;
}
