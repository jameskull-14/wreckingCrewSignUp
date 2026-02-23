// Admin User Setting types matching backend schemas

export interface AdminUserSetting {
    admin_setting_id: number;
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
    created_date: string;
    updated_date: string;
}

export interface AdminUserSettingCreate {
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
}

export interface AdminUserSettingUpdate {
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
}
