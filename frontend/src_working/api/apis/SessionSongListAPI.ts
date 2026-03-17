import { SessionSongListCreate } from "../../types/apiTypes/sessionSongList";
import { apiClient } from "./APIClient";

export class SessionSongListAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(session_song_list_id: number){
        return this.client.request(`/api/session-song-lists/${session_song_list_id}`, { method: 'GET' });
    }

    async list(session_id?: number, song_list_id?: number){
        const params = new URLSearchParams();
        if (session_id) params.append('session_id', session_id.toString());
        if (song_list_id) params.append('song_list_id', song_list_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/session-song-lists${query}`, { method: 'GET' });
    }

    async create(session_song_list_data: SessionSongListCreate){
        return this.client.request('/api/session-song-lists/', {
            method: 'POST',
            body: JSON.stringify(session_song_list_data)
        });
    }

    async delete(id: number) {
        return this.client.request(`/api/session-song-lists/${id}`,{
            method: 'DELETE',
        })
    }
}

export const SessionSongListClient = new SessionSongListAPI(apiClient);

interface ClientOptions{
    request: any
}
