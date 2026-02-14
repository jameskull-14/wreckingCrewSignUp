// Session Song types matching backend schemas

export interface SessionSong {
    session_id: number;
    song_id: number;
}

export interface SessionSongCreate {
    session_id: number;
    song_id: number;
}
