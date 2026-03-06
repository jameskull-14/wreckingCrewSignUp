import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Music, Sparkles, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSetting } from "../types/apiTypes/adminUserSetting.js";
import SessionViewPanel from "../components/session/SessionViewPanel.js";
import { WebSocketProvider, useWebSocket } from "../context/WebSocketContext.js";


interface PublicPageInterface{
    adminId: string,
    sessionId: string
}

function PublicKaraokePageContent({
    adminId,
    sessionId
}: PublicPageInterface) {
    const { subscribe } = useWebSocket();
    const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);
    const [adminSettings, setAdminSettings] = useState<AdminUserSetting | null>(null);
    const [sessionActive, setSessionActive] = useState(() =>
        localStorage.getItem(`karaoke_session_${adminId}`) === 'active'
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch admin info and settings in parallel for better performance
                const [adminRes, settingsRes] = await Promise.all([
                    fetch(`/api/admin-users/${adminId}`),
                    fetch(`/api/admin-user-settings?admin_user_id=${adminId}`)
                ]);

                if (adminRes.ok) {
                    const adminData = await adminRes.json();
                    setAdminInfo(adminData);
                }

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    // API returns an array, get the first item
                    if (settingsData && settingsData.length > 0) {
                        setAdminSettings(settingsData[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to load admin data:", error);
            }
        };

        if (adminId) loadData();
    }, [adminId]);

    // Subscribe to WebSocket updates for real-time setting changes
    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            if (message.type === 'settings_updated') {
                // Update settings when admin changes them
                setAdminSettings(message.data);
            } else if (message.type === 'session_ended') {
                // End session when admin ends it
                setSessionActive(false);
            }
        });

        return unsubscribe;
    }, [subscribe]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `karaoke_session_${adminId}`) {
                setSessionActive(e.newValue === 'active');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [adminId]);

    if (!sessionActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mx-auto">
                        <PowerOff className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">Session Ended</h1>
                    <p className="text-gray-400">The karaoke session is no longer active.</p>
                </motion.div>
            </div>
        );
    }

    return (
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
                                    Karaoke Live
                                </h1>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <p className="text-amber-200/80 text-lg">Sign up • Sing • Shine</p>
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                        </div>

                        {adminInfo && (
                            <div className="flex justify-center items-center gap-4 flex-wrap">
                                <span className="text-amber-300 font-semibold">
                                    Hosted by {adminSettings?.session_host ? adminSettings.session_host : adminInfo.first_name}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
                <SessionViewPanel
                    isAdmin={false}
                    adminSettings={adminSettings}
                    sessionId = {sessionId}
                ></SessionViewPanel>
            </div>
        </div>
    );
}

export default function PublicKaraokePage() {
    const { adminId, sessionId} = useParams<{ adminId:string; sessionId: string}>();

    if (!adminId || !sessionId) {
        return <div>Invalid session</div>;
    }

    return (
        <WebSocketProvider adminId={adminId}>
            <PublicKaraokePageContent 
                adminId={adminId}
                sessionId={sessionId}
            />
        </WebSocketProvider>
    );
}
