import { useEffect, useState } from "react"
import AdminControlPanel from "../components/admin-control-panel/AdminControlPanel.js"
import { Music, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSetting, AdminUserSettingUpdate } from "../types/apiTypes/adminUserSetting.js";
import { Session } from "../types/apiTypes/session.js";
import { AdminUserSettingClient } from "../api/apis/AdminUserSettingAPI.js";
import { SessionClient } from "../api/frontendClient.js";
import { WebSocketProvider } from "../context/WebSocketContext.js";

export default function AdminPage ({ adminInfo }: { adminInfo: AdminUser }) {
    const [adminSettings, setAdminSettings] = useState<AdminUserSetting | null>(null);
    const [adminData, setAdminData] = useState<AdminUser | null>(null);
    const [activeSession, setActiveSession] = useState<Session | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try{
                // Load settings and active session in parallel
                const [settingsRes, sessionRes] = await Promise.all([
                    fetch(`api/admin-user-settings?admin_user_id=${adminInfo.admin_user_id}`),
                    fetch(`api/sessions?admin_user_id=${adminInfo.admin_user_id}&status=Active`)
                ]);

                const settings = await settingsRes.json();
                const sessions = await sessionRes.json();

                // API returns array, take first element
                const adminSetting = Array.isArray(settings) && settings.length > 0 ? settings[0] : null;
                setAdminSettings(adminSetting);
                setAdminData(adminInfo);

                // Set active session if one exists
                if (Array.isArray(sessions) && sessions.length > 0) {
                    setActiveSession(sessions[0]);
                    // Sync localStorage for backward compatibility
                    localStorage.setItem(`karaoke_session_${adminInfo.admin_user_id}`, 'active');
                } else {
                    setActiveSession(null);
                    localStorage.removeItem(`karaoke_session_${adminInfo.admin_user_id}`);
                }
            }
            catch(error){
                console.error('Failed to load Admin data: ', error);
            }
        };
        loadData();
    }, [adminInfo.admin_user_id])

    const updateAdminSettings = async(newSettings: AdminUserSettingUpdate) => {
        if (!adminSettings?.admin_setting_id) {
            console.error('No admin_setting_id found');
            return;
        }

        // Update admin settings (this broadcasts via WebSocket automatically)
        await AdminUserSettingClient.update(adminSettings.admin_setting_id, newSettings)

        // If there's an active session, update it too
        if (activeSession) {
            await SessionClient.update(activeSession.session_id,newSettings)
        }

        // Merge the update with existing settings
        setAdminSettings(prev => prev ? { ...prev, ...newSettings } : null);
    }


    return(
    <WebSocketProvider adminId={adminInfo.admin_user_id}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600')] bg-cover bg-center opacity-5" />
                <div className="relative z-10 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                                <Music className="w-8 h-8 text-gray-900" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                                {adminSettings?.session_title}
                                </h1>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <p className="text-amber-200/80 text-lg">Sign up • Sing • Shine</p>
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            </div>

                            <div className="flex justify-center items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-300 font-semibold">Admin: {adminData?.first_name || "Unkown User"}</span>
                                </div>
                            </div>
                        </motion.div>
                        <AdminControlPanel
                            adminSettings={adminSettings}
                            onUpdateAdminSettings={updateAdminSettings}
                            adminInfo={adminInfo}
                            activeSession={activeSession}
                            setActiveSession={setActiveSession}
                        />
                    </div>
                </div>
            </div>
        </WebSocketProvider>
    );
}
