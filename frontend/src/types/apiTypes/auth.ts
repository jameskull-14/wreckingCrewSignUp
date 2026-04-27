import { AdminUser } from "./adminUser";

export interface AuthResponse {
    user: AdminUser;
    access_token: string;
}
