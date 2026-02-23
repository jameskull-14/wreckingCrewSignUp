// Session types matching backend schemas

export interface Session {
    session_id: number;
    admin_user_id: number;
    session_title: string;
    session_host?: string;
    use_all_songs: boolean;
    allow_song_reuse: boolean;
    session_mode: string;
    songs_per_performer: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status: string;
    created_date: string;
    updated_date: string;
}

export interface SessionCreate {
    admin_user_id: number;
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode: string;
    songs_per_performer?: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status?: string;
}

export interface SessionUpdate {
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode?: string;
    songs_per_performer?: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status?: string;
}
