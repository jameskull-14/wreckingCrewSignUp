import { AdminUserCreate, AdminUserUpdate, AdminUserLogin } from "../../types/apiTypes/adminUser";
import { apiClient } from "./APIClient";

export class AdminUserAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(admin_user_id: number){
        return this.client.request(`/api/admin-users/${admin_user_id}`, { method: 'GET' });
    }

    async list(email?: string){
        const params = new URLSearchParams();
        if (email) params.append('email', email);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/admin-users${query}`, { method: 'GET' });
    }

    async create(user_data: AdminUserCreate){
        return this.client.request('/api/admin-users', {
            method: 'POST',
            body: JSON.stringify(user_data)
        });
    }

    async update(id: number, user_data: AdminUserUpdate){
        return this.client.request(`/api/admin-users/${id}`,{
            method: 'PUT',
            body: JSON.stringify(user_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/admin-users/${id}`,{
            method: 'DELETE',
        })
    }

    async login(credentials: AdminUserLogin){
        return this.client.request('/api/admin-users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
}

export const AdminUserClient = new AdminUserAPI(apiClient);

interface ClientOptions{
    request: any
}
