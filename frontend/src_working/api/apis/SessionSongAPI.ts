import { SessionSongCreate } from "../../types/sessionSong";
import { apiClient } from "./APIClient";

export class SessionSongAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async list(session_id?: number, song_id?: number){
        const params = new URLSearchParams();
        if (session_id) params.append('session_id', session_id.toString());
        if (song_id) params.append('song_id', song_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/session-songs${query}`);
    }

    async create(data: SessionSongCreate){
        return this.client.request('/api/session-songs', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async delete(session_id: number, song_id: number) {
        return this.client.request(`/api/session-songs/${session_id}/${song_id}`,{
            method: 'DELETE',
        })
    }
}

export const SessionSong = new SessionSongAPI(apiClient);

interface ClientOptions{
    request: any
}
