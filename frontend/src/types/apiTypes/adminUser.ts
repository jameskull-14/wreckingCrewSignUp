// Admin User types matching backend schemas

export interface AdminUser {
    admin_user_id: number;
    email: string;
    first_name: string;
    last_name?: string;
    created_on: string;
    last_login?: string;
    login_attempts?: number;
    locked_until?: string;
}

export interface AdminUserCreate {
    email: string;
    first_name: string;
    last_name?: string;
    password: string;
}

export interface AdminUserUpdate {
    email?: string;
    first_name?: string;
    last_name?: string;
    password?: string;
}

export interface AdminUserLogin {
    email: string;
    password: string;
}
