import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Music, Sparkles, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { AdminUser } from "../types/apiTypes/adminUser.js";
import { AdminUserSetting } from "../types/apiTypes/adminUserSetting.js";
import { Session } from "../types/apiTypes/session.js";
import { WebSocketMessageType } from "../types/apiTypes/websocket.js";
import { WebSocketProvider, useWebSocket } from "../context/WebSocketContext.js";
import { AdminUserClient, AdminUserSettingClient, SessionClient } from "../api/frontendClient.js";
import SessionViewPanel from "../components/session/SessionViewPanel.js";


interface PublicPageInterface{
    adminId: string,
    sessionId?: string
}

function PublicKaraokePageContent({
    adminId,
    sessionId
}: PublicPageInterface) {
    const { subscribe } = useWebSocket();
    const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);
    const [adminSettings, setAdminSettings] = useState<AdminUserSetting | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId || null);
    const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [adminData, settingsData] = await Promise.all([
                    AdminUserClient.get(parseInt(adminId)),
                    AdminUserSettingClient.list(parseInt(adminId))
                ]);

                setAdminInfo(adminData);
                if (settingsData && settingsData.length > 0) {
                    setAdminSettings(settingsData[0]);
                }

                // If no sessionId in URL, find the active session for this admin
                let resolvedSessionId = sessionId;
                if (!resolvedSessionId) {
                    const activeSessions = await SessionClient.list(parseInt(adminId), 'Active');
                    if (activeSessions && activeSessions.length > 0) {
                        resolvedSessionId = activeSessions[0].session_id.toString();
                        setActiveSessionId(resolvedSessionId);
                    }
                }

                if (!resolvedSessionId) {
                    setSessionActive(false);
                    return;
                }

                const sessionData = await SessionClient.get(parseInt(resolvedSessionId));
                setSession(sessionData);

                if (sessionData && sessionData.status === 'Active') {
                    setActiveSessionId(resolvedSessionId);
                    setSessionActive(true);
                } else {
                    setSessionActive(false);
                }
            } catch (error) {
                console.error("Failed to load admin data:", error);
                setSessionActive(false);
            }
        };

        if (adminId) loadData();
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
        if (!activeSessionId) return;

        const checkSessionStatus = async () => {
            try {
                const s = await SessionClient.get(parseInt(activeSessionId));
                if (s && s.status !== 'Active') {
                    setSessionActive(false);
                }
            } catch (error) {
                console.error('Error checking session status:', error);
            }
        };

        const interval = setInterval(checkSessionStatus, 10000);
        return () => clearInterval(interval);
    }, [activeSessionId]);

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
                                {session?.custom_link_url && session?.custom_link_prompt && session?.custom_link_text && (
                                    <p style={{ color: 'rgba(253,230,138,0.9)', fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                                        {session.custom_link_prompt}{' '}
                                        <a
                                            href={session.custom_link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}
                                        >
                                            {session.custom_link_text}
                                        </a>
                                    </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Sparkles style={{ width: '28px', height: '28px', color: '#fbbf24' }} />
                                    <p style={{ color: 'rgba(253,230,138,0.85)', fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Sign up • Sing • Shine</p>
                                    <Sparkles style={{ width: '28px', height: '28px', color: '#fbbf24' }} />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {adminInfo && adminSettings && activeSessionId && (
                        <SessionViewPanel
                            adminSettings={adminSettings}
                            sessionId={activeSessionId}
                            isAdmin={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PublicKaraokePage() {
    const { adminId, sessionId } = useParams<{ adminId: string; sessionId?: string }>();

    if (!adminId) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center space-y-4">
                    <h1 className="text-4xl font-bold text-red-400">Invalid Session</h1>
                    <p className="text-gray-400">Missing admin ID in URL</p>
                </div>
            </div>
        );
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
