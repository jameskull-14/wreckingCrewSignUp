import { AdminAllowedSongCreate } from "../../types/apiTypes/adminAllowedSong";
import { apiClient } from "./APIClient";

export class AdminAllowedSongAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async list(admin_user_id?: number, song_id?: number){
        const params = new URLSearchParams();
        if (admin_user_id) params.append('admin_user_id', admin_user_id.toString());
        if (song_id) params.append('song_id', song_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/admin-allowed-songs${query}`, {
            method: 'GET'
        });
    }

    async create(data: AdminAllowedSongCreate){
        return this.client.request('/api/admin-allowed-songs', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async delete(admin_user_id: number, song_id: number) {
        return this.client.request(`/api/admin-allowed-songs/${admin_user_id}/${song_id}`,{
            method: 'DELETE',
        })
    }
}

export const AdminAllowedSongClient = new AdminAllowedSongAPI(apiClient);

interface ClientOptions{
    request: any
}
