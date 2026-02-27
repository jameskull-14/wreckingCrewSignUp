// Session types matching backend schemas

export enum SessionStatus {
    Active = "Active",
    Completed = "Completed",
    Paused = "Paused"
}

export enum SessionMode {
    Time = 'Time',
    Order = 'Order'
}

export interface Session {
    session_id: number;
    admin_user_id: number;
    session_title: string;
    session_host?: string;
    use_all_songs: boolean;
    allow_song_reuse: boolean;
    session_mode: SessionMode;
    songs_per_performer: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status: SessionStatus;
    created_date: string;
    updated_date: string;
}

export interface SessionCreate {
    admin_user_id: number;
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode: SessionMode;
    songs_per_performer?: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status?: SessionStatus;
}

export interface SessionUpdate {
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode?: SessionMode;
    songs_per_performer?: number;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    status?: SessionStatus;
}
