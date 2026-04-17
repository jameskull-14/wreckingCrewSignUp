import { SongCreate, SongUpdate } from "../../types/apiTypes/song";
import { apiClient } from "./APIClient";

export class SongAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(song_id: number){
        return this.client.request(`/api/songs/${song_id}`, {
            method: 'GET'
        });
    }

    async search(params?: { song_title?: string; artist?: string; genre?: string }){
        const queryParams = new URLSearchParams();
        if (params?.song_title) queryParams.append('song_title', params.song_title);
        if (params?.artist) queryParams.append('artist', params.artist);
        if (params?.genre) queryParams.append('genre', params.genre);

        const queryString = queryParams.toString();
        return this.client.request(`/api/songs${queryString ? `?${queryString}` : ''}`, {
            method: 'GET'
        });
    }

    async create(song_data: SongCreate){
        return this.client.request('/api/songs', {
            method: 'POST',
            body: JSON.stringify(song_data)
        });
    }

    async bulkCreate(song_data: SongCreate){
        return this.client.request('/api/songs/bulk', {
            method: 'POST',
            body: JSON.stringify(song_data),
        });
    }

    async update(id: number, song_data: SongUpdate){
        return this.client.request(`/api/songs/${id}`,{
            method: 'PUT',
            body: JSON.stringify(song_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/songs/${id}`,{
            method: 'DELETE',
        })
    }
}

export const SongClient = new SongAPI(apiClient);

interface ClientOptions{
    request: any
}