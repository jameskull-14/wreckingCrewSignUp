import { SessionCreate, SessionUpdate } from "../../types/apiTypes/session";
import { apiClient } from "./APIClient";

export class SessionAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(session_id: number){
        return this.client.request(`/api/sessions/${session_id}`, { method: 'GET' });
    }

    async getInfo(session_id: number){
        return this.client.request(`/api/sessions/${session_id}/info`, { method: 'GET' });
    }

    async list(admin_user_id?: number, status?: string){
        const params = new URLSearchParams();
        if (admin_user_id) params.append('admin_user_id', admin_user_id.toString());
        if (status) params.append('status', status);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/sessions${query}`, { method: 'GET' });
    }

    async create(session_data: SessionCreate){
        return this.client.request('/api/sessions', {
            method: 'POST',
            body: JSON.stringify(session_data)
        });
    }

    async update(id: number, session_data: SessionUpdate){
        return this.client.request(`/api/sessions/${id}`,{
            method: 'PUT',
            body: JSON.stringify(session_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/sessions/${id}`,{
            method: 'DELETE',
        })
    }

    async generateTimeSlots(session_id: number) {
        return this.client.request(`/api/sessions/${session_id}/generate-time-slots`, {
            method: 'POST'
        });
    }
}

export const SessionClient = new SessionAPI(apiClient);

interface ClientOptions{
    request: any
}
