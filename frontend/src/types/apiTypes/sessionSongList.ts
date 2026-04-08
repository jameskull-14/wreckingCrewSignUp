// Session Song List types matching backend schemas

export interface SessionSongList {
    session_song_list_id: number;
    session_id: number;
    song_list_id: number;
    applied_at: string;
}

export interface SessionSongListCreate {
    session_id: number;
    song_list_id: number;
}
