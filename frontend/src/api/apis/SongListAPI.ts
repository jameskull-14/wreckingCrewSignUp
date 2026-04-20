import { SongListCreate, SongListUpdate } from "../../types/apiTypes/songList";
import { apiClient } from "./APIClient";

export class SongListAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(song_list_id: number){
        return this.client.request(`/api/song-lists/${song_list_id}`, { method: 'GET' });
    }

    async list(admin_user_id?: number){
        const params = new URLSearchParams();
        if (admin_user_id) params.append('admin_user_id', admin_user_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/song-lists${query}`, { method: 'GET' });
    }

    async create(song_list_data: SongListCreate){
        return this.client.request('/api/song-lists', {
            method: 'POST',
            body: JSON.stringify(song_list_data)
        });
    }

    async update(id: number, song_list_data: SongListUpdate){
        return this.client.request(`/api/song-lists/${id}`,{
            method: 'PUT',
            body: JSON.stringify(song_list_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/song-lists/${id}`,{
            method: 'DELETE',
        })
    }

    async uploadCSV(file: File, admin_user_id: number, list_name: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('admin_user_id', admin_user_id.toString());
        formData.append('list_name', list_name);

        return this.client.request('/api/song-lists/upload', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary
            headers: {}
        });
    }
}

export const SongListClient = new SongListAPI(apiClient);

interface ClientOptions{
    request: any
}
