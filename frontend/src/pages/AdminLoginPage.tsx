import { useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import AuthForm from "../components/auth/AuthForm.js";
import { AdminUser } from "../types/apiTypes/adminUser";
import { AuthClient } from "../api/apis/AuthAPI.js";

export default function AdminLoginPage() {
    const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check for existing auth token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("admin_auth_token");
            const userStr = localStorage.getItem("admin_user");

            if (token && userStr) {
                const valid = await AuthClient.verify(token);
                if (valid) {
                    setAdminInfo(JSON.parse(userStr));
                    setAuthToken(token);
                } else {
                    localStorage.removeItem("admin_auth_token");
                    localStorage.removeItem("admin_user");
                }
            }

            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    const handleAuthSuccess = (user: AdminUser, token: string) => {
        // Store auth info
        localStorage.setItem("admin_auth_token", token);
        localStorage.setItem("admin_user", JSON.stringify(user));

        // Update state
        setAdminInfo(user);
        setAuthToken(token);

    };

    const handleLogout = () => {
        // Clear auth info
        localStorage.removeItem("admin_auth_token");
        localStorage.removeItem("admin_user");

        // Clear state
        setAdminInfo(null);
        setAuthToken(null);

    };

    // Show loading while checking auth
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-amber-400 text-xl">Loading...</div>
            </div>
        );
    }

    // Show login/register form if not authenticated
    if (!adminInfo || !authToken) {
        return <AuthForm onAuthSuccess={handleAuthSuccess} />;
    }

    // Show admin page if authenticated
    return <AdminPage adminInfo={adminInfo} onLogout={handleLogout} />;
}