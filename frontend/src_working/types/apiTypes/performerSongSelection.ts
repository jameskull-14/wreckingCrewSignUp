// Performer Song Selection types matching backend schemas
import { PerformerStatus } from './performer';

export interface PerformerSongSelection {
    performer_selection_id: number;
    performer_id: number;
    song_id: number;
    selection_order: string;
    is_singing: boolean;
    instrument?: string;
    status: PerformerStatus;
    created_at: string;
}

export interface PerformerSongSelectionCreate {
    performer_id: number;
    song_id: number;
    selection_order: string;
    is_singing: boolean;
    instrument?: string;
    status: PerformerStatus;
}

export interface PerformerSongSelectionUpdate {
    selection_order?: string;
    is_singing?: boolean;
    instrument?: string;
    status?: PerformerStatus;
}
