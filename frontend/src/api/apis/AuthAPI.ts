import { AdminUserCreate, AdminUserLogin } from "../../types/apiTypes/adminUser";
import { AuthResponse } from "../../types/apiTypes/auth";
import { apiClient } from "./APIClient";

export class AuthAPI {
    client: ClientOptions;

    constructor(client: ClientOptions) {
        this.client = client;
    }

    async login(credentials: AdminUserLogin): Promise<AuthResponse> {
        return this.client.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async register(userData: AdminUserCreate): Promise<AuthResponse> {
        await this.client.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return this.login({ email: userData.email, password: userData.password });
    }

    async verify(token: string): Promise<boolean> {
        try {
            await this.client.request('/api/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
            return true;
        } catch {
            return false;
        }
    }
}

export const AuthClient = new AuthAPI(apiClient);

interface ClientOptions {
    request: any;
}
