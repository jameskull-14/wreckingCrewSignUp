// Session Song types matching backend schemas

export interface SessionSong {
    session_id: number;
    song_id: number;
    song_title?: string;
    artist?: string;
}

export interface SessionSongCreate {
    session_id: number;
    song_id: number;
}
