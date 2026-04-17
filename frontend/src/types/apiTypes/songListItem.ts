// Song List Item types matching backend schemas

export interface SongListItem {
    item_id: number;
    song_list_id: number;
    song_id: number;
    raw_title: string;
    raw_artist: string | null;
}

export interface SongListItemCreate {
    song_list_id: number;
    song_id: number;
    raw_title: string;
    raw_artist?: string | null;
}

export interface SongListItemUpdate {
    song_id?: number;
    raw_title?: string;
    raw_artist?: string | null;
}
