// Admin Allowed Song types matching backend schemas

export interface AdminAllowedSong {
    admin_user_id: number;
    song_id: number;
    song_title?: string;
    artist?: string;
}

export interface AdminAllowedSongCreate {
    admin_user_id: number;
    song_id: number;
}
