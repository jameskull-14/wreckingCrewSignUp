import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Music, Sparkles, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSetting } from "../types/apiTypes/adminUserSetting.js";
import { WebSocketMessageType } from "../types/apiTypes/websocket.js";
import { WebSocketProvider, useWebSocket } from "../context/WebSocketContext.js";
import { AdminUserClient, AdminUserSettingClient, SessionClient } from "../api/frontendClient.js";
import SessionViewPanel from "../components/session/SessionViewPanel.js";


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
    const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {
        console.log('🎤 PublicKaraokePage loading...');
        console.log('Admin ID:', adminId);
        console.log('Session ID:', sessionId);

        const loadData = async () => {
            try {
                console.log('📥 Fetching admin data and settings...');
                // Fetch admin info, settings, and verify session status
                const [adminData, settingsData] = await Promise.all([
                    AdminUserClient.get(parseInt(adminId)),
                    AdminUserSettingClient.list(parseInt(adminId))
                ]);

                console.log('Admin data:', adminData);
                console.log('Settings data:', settingsData);
                setAdminInfo(adminData);

                // API returns an array, get the first item
                if (settingsData && settingsData.length > 0) {
                    setAdminSettings(settingsData[0]);
                }

                // Check if THIS specific session is actually active
                console.log('🔍 Checking session status...');
                const session = await SessionClient.get(parseInt(sessionId));
                console.log('Session data:', session);

                // Only set active if session exists and status is "Active" (not "Complete")
                if (session && session.status === 'Active') {
                    console.log('✅ Session is active');
                    setSessionActive(true);
                } else {
                    console.log('❌ Session is not active. Status:', session?.status);
                    setSessionActive(false);
                }
            } catch (error) {
                console.error("Failed to load admin data:", error);
                setSessionActive(false);
            }
        };

        if (adminId && sessionId) loadData();
    }, [adminId, sessionId]);

    // Subscribe to WebSocket updates for real-time setting changes
    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            if (message.type === WebSocketMessageType.SETTINGS_UPDATED) {
                // Update settings when admin changes them
                setAdminSettings(message.data);
            } else if (message.type === WebSocketMessageType.SESSION_ENDED) {
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

    // Periodically check session status to ensure it hasn't been completed
    useEffect(() => {
        if (!sessionId) return;

        const checkSessionStatus = async () => {
            try {
                const session = await SessionClient.get(parseInt(sessionId));
                if (session && session.status !== 'Active') {
                    console.log('⚠️ Session is no longer active, status:', session.status);
                    setSessionActive(false);
                }
            } catch (error) {
                console.error('Error checking session status:', error);
            }
        };

        // Check every 10 seconds
        const interval = setInterval(checkSessionStatus, 10000);
        return () => clearInterval(interval);
    }, [sessionId]);

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
                            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                                {adminSettings?.session_title || "Karaoke Live"}
                            </h1>
                        </div>

                        {adminInfo && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#fcd34d', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '0.02em' }}>
                                    Hosted by {adminSettings?.session_host ? adminSettings.session_host : adminInfo.first_name}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Sparkles style={{ width: '28px', height: '28px', color: '#fbbf24' }} />
                                    <p style={{ color: 'rgba(253,230,138,0.85)', fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Sign up • Sing • Shine</p>
                                    <Sparkles style={{ width: '28px', height: '28px', color: '#fbbf24' }} />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {adminInfo && adminSettings && (
                        <SessionViewPanel
                            adminSettings={adminSettings}
                            sessionId={sessionId}
                            isAdmin={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PublicKaraokePage() {
    const { adminId, sessionId} = useParams<{ adminId:string; sessionId: string}>();

    console.log('🌐 PublicKaraokePage - URL params:', { adminId, sessionId });

    if (!adminId || !sessionId) {
        console.error('❌ Invalid session - missing adminId or sessionId');
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                    <h1 className="text-4xl font-bold text-red-400">Invalid Session</h1>
                    <p className="text-gray-400">Missing admin ID or session ID in URL</p>
                    <p className="text-sm text-gray-500">URL format: /public_session/[adminId]/[sessionId]</p>
                </div>
            </div>
        );
    }

    console.log('✅ Valid params, rendering PublicKaraokePageContent');

    return (
        <WebSocketProvider adminId={adminId}>
            <PublicKaraokePageContent
                adminId={adminId}
                sessionId={sessionId}
            />
        </WebSocketProvider>
    );
}
