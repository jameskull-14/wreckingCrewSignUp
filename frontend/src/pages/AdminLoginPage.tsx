import { useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import AuthForm from "../components/auth/AuthForm.js";
import { AdminUser } from "../types/apiTypes/adminUser";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
                try {
                    // Verify token is still valid
                    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (response.ok) {
                        // Token is valid, restore session
                        const user = JSON.parse(userStr);
                        setAdminInfo(user);
                        setAuthToken(token);
                    } else {
                        // Token is invalid, clear storage
                        localStorage.removeItem("admin_auth_token");
                        localStorage.removeItem("admin_user");
                    }
                } catch (error) {
                    console.error("Error verifying token:", error);
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

        console.log("✅ Authentication successful:", user);
    };

    const handleLogout = () => {
        // Clear auth info
        localStorage.removeItem("admin_auth_token");
        localStorage.removeItem("admin_user");

        // Clear state
        setAdminInfo(null);
        setAuthToken(null);

        console.log("👋 Logged out");
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