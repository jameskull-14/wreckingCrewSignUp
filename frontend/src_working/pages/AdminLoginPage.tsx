import { useEffect, useState } from "react";
import AdminPage from "./AdminPage";
import { AdminUser } from "../types/apiTypes/adminUser";

export default function AdminLoginPage()
{
    const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);

    useEffect(() => {
        const loadAdmin = async () => {
            try {
                const response = await fetch('api/admin-users/1');
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers.get('content-type'));

                const text = await response.text();
                console.log('Response text:', text);

                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                    return;
                }

                const data = JSON.parse(text);
                setAdminInfo(data);
            } catch (error) {
                console.error('Error loading admin:', error);
            }
        };
        loadAdmin();
    }, []);

    if (!adminInfo) return <div>Loading...</div>;

    return <AdminPage adminInfo={adminInfo} />;
}