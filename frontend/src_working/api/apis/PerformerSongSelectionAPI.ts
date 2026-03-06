import { PerformerSongSelectionCreate, PerformerSongSelectionUpdate } from "../../types/apiTypes/performerSongSelection";
import { apiClient } from "./APIClient";

export class PerformerSongSelectionAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(session_id: string){
        return this.client.request(`/api/performer-song-selections?session_id=${session_id}`, { method: 'GET' });
    }

    async create(selection_data: PerformerSongSelectionCreate){
        return this.client.request('/api/performer-song-selections', {
            method: 'POST',
            body: JSON.stringify(selection_data)
        });
    }

    async update(id: number, selection_data: PerformerSongSelectionUpdate){
        return this.client.request(`/api/performer-song-selections/${id}`,{
            method: 'PUT',
            body: JSON.stringify(selection_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/performer-song-selections/${id}`,{
            method: 'DELETE',
        })
    }
}

export const PerformerSongSelectionClient = new PerformerSongSelectionAPI(apiClient);

interface ClientOptions{
    request: any
}
