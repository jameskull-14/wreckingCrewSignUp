import { AdminUserSettingCreate, AdminUserSettingUpdate } from "../../types/apiTypes/adminUserSetting";
import { apiClient } from "./APIClient";

export class AdminUserSettingAPI {
    client: ClientOptions

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async get(setting_id: number){
        return this.client.request(`/api/admin-user-settings/${setting_id}`);
    }

    async list(admin_user_id?: number){
        const params = new URLSearchParams();
        if (admin_user_id) params.append('admin_user_id', admin_user_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.client.request(`/api/admin-user-settings${query}`);
    }

    async create(setting_data: AdminUserSettingCreate){
        return this.client.request('/api/admin-user-settings', {
            method: 'POST',
            body: JSON.stringify(setting_data)
        });
    }

    async update(id: number, setting_data: AdminUserSettingUpdate){
        return this.client.request(`/api/admin-user-settings/${id}`,{
            method: 'PUT',
            body: JSON.stringify(setting_data),
        })
    }

    async delete(id: number) {
        return this.client.request(`/api/admin-user-settings/${id}`,{
            method: 'DELETE',
        })
    }
}

export const AdminUserSetting = new AdminUserSettingAPI(apiClient);

interface ClientOptions{
    request: any
}
