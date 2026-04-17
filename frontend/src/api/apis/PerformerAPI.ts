import { PerformerCreate, PerformerUpdate } from "../../types/apiTypes/performer";
import { apiClient } from "./APIClient";

export class PerformerAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(performer_id: number){
        return this.client.request(`/api/performers/${performer_id}`, { method: 'GET' });
    }

    async list(session_id?: string, status?: string){
        const params = new URLSearchParams();
        if (session_id) params.append('session_id', session_id);
        if (status) params.append('status', status);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/performers${query}`, { method: 'GET' });
    }

    async create(performer_data: PerformerCreate){
        return this.client.request('/api/performers/', {
            method: 'POST',
            body: JSON.stringify(performer_data)
        });
    }

    async update(id: number, performer_data: PerformerUpdate){
        return this.client.request(`/api/performers/${id}`,{
            method: 'PUT',
            body: JSON.stringify(performer_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/performers/${id}`,{
            method: 'DELETE',
        })
    }
}

export const PerformerClient = new PerformerAPI(apiClient);

interface ClientOptions{
    request: any
}
