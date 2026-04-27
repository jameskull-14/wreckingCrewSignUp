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
    allow_instrument_use: boolean;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    featured_act_name?: string;
    featured_act_start_time?: string;
    featured_act_end_time?: string;
    featured_act_status?: string;
    featured_act_link_url?: string;
    featured_act_link_text?: string;
    custom_link_url?: string;
    custom_link_prompt?: string;
    custom_link_text?: string;
    show_performer_status?: boolean;
    show_song_status?: boolean;
    status: SessionStatus;
    created_date: string;
    updated_date: string;
    song_count?: number;
    performer_count?: number;
    total_session_songs?: number;
}

export interface SessionCreate {
    admin_user_id: number;
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode: SessionMode;
    songs_per_performer?: number;
    allow_instrument_use?: boolean;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    featured_act_name?: string;
    featured_act_start_time?: string;
    featured_act_end_time?: string;
    featured_act_status?: string;
    featured_act_link_url?: string;
    featured_act_link_text?: string;
    custom_link_url?: string;
    custom_link_prompt?: string;
    custom_link_text?: string;
    show_performer_status?: boolean;
    show_song_status?: boolean;
    status?: SessionStatus;
}

export interface SessionUpdate {
    session_title?: string;
    session_host?: string;
    use_all_songs?: boolean;
    allow_song_reuse?: boolean;
    session_mode?: SessionMode;
    songs_per_performer?: number;
    allow_instrument_use?: boolean;
    start_time?: string;
    end_time?: string;
    changeover_time?: string;
    performance_time?: string;
    featured_act_name?: string;
    featured_act_start_time?: string;
    featured_act_end_time?: string;
    featured_act_status?: string;
    featured_act_link_url?: string;
    featured_act_link_text?: string;
    custom_link_url?: string;
    custom_link_prompt?: string;
    custom_link_text?: string;
    show_performer_status?: boolean;
    show_song_status?: boolean;
    status?: SessionStatus;
}
