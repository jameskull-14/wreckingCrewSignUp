import { SongListItemCreate, SongListItemUpdate } from "../../types/apiTypes/songListItem";
import { apiClient } from "./APIClient";

export class SongListItemAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(item_id: number){
        return this.client.request(`/api/song-list-items/${item_id}`, { method: 'GET' });
    }

    async list(song_list_id?: number){
        const params = new URLSearchParams();
        if (song_list_id) params.append('song_list_id', song_list_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/song-list-items${query}`, { method: 'GET' });
    }

    async create(item_data: SongListItemCreate){
        return this.client.request('/api/song-list-items', {
            method: 'POST',
            body: JSON.stringify(item_data)
        });
    }

    async update(id: number, item_data: SongListItemUpdate){
        return this.client.request(`/api/song-list-items/${id}`,{
            method: 'PUT',
            body: JSON.stringify(item_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/song-list-items/${id}`,{
            method: 'DELETE',
        })
    }
}

export const SongListItemClient = new SongListItemAPI(apiClient);

interface ClientOptions{
    request: any
}
