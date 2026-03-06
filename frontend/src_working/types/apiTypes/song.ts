// Song types matching backend schemas

export interface Song {
    song_id: number;
    song_title: string;
    artist: string;
    genre?: string;
    year_released?: number;
    verified: boolean;
}

export interface SongCreate {
    title: string;
    artist: string;
    genre?: string;
    year_released?: number;
}

export interface SongUpdate {
    song_title?: string;
    artist?: string;
    genre?: string;
    year_released?: number;
    verified?: boolean;
}

export interface SkippedSong {
    title: string;
    artist: string;
    reason: string;
}

export interface BulkCreateResponse {
    created: Song[];
    skipped: SkippedSong[];
    total_submitted: number;
    total_created: number;
    total_skipped: number;
}

export interface SongFilters {
    song_id?: number;
    song_title?: string;
    artist?: string;
    genre?: string;
    year_released?: number;
    verified?: boolean;
}
