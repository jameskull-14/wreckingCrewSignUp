// Song List types matching backend schemas

export interface SongList {
    song_list_id: number;
    admin_user_id: number;
    list_name: string;
    original_filename: string;
    uploaded_at: string;
}

export interface SongListCreate {
    admin_user_id: number;
    list_name: string;
    original_filename: string;
}

export interface SongListUpdate {
    list_name?: string;
    original_filename?: string;
}
