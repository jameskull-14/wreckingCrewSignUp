// Admin User Setting types matching backend schemas
import { SessionMode } from "./session";

export interface AdminUserSetting {
    admin_setting_id: number;
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
    created_date: string;
    updated_date: string;
}

export interface AdminUserSettingCreate {
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
}

export interface AdminUserSettingUpdate {
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
}
