import { Card, CardHeader, CardTitle } from "../shared/Card.js";
import { Settings } from "lucide-react";
import LaunchKaraokeSession from "./header/LaunchKaraokeSession.js";
import NavigationContent from "./navigation/NavigationContent.js";
import { AdminControlPanelProps } from "../../types/componentTypes/adminControlPanelProps.js";
import { Session } from "../../types/apiTypes/session.js";
import { useRef, useState } from "react";
import EndKaraokeSession from "./header/EndKaraokeSession.js";
import AdminQRCode from "./header/AdminQRCode.js";


export default function AdminControlPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo,
    activeSession,
    setActiveSession
}: AdminControlPanelProps) {

    const publicWindowRef = useRef<Window | null>(null);
    const qrWindowRef = useRef<Window | null>(null);
    const [sessionLaunchTrigger, setSessionLaunchTrigger] = useState(0);


    const onUpdateSession = async (session: Session | null) => {
        console.log('\n========================================');
        console.log('AdminControlPanel: onUpdateSession called');
        console.log('  Previous activeSession:', activeSession);
        console.log('  New session:', session);
        console.log('========================================\n');

        setActiveSession(session);

        // Increment trigger when session starts to refresh allowed songs
        if (session) {
            console.log('  → Session started, incrementing sessionLaunchTrigger');
            setSessionLaunchTrigger(prev => {
                const newValue = prev + 1;
                console.log('    sessionLaunchTrigger:', prev, '->', newValue);
                return newValue;
            });
        }

        // Close all windows when ending session
        if (!session) {
            console.log('  → Session ended, closing windows');
            if (publicWindowRef.current && !publicWindowRef.current.closed) {
                publicWindowRef.current.close();
            }
            if (qrWindowRef.current && !qrWindowRef.current.closed) {
                qrWindowRef.current.close();
            }
            publicWindowRef.current = null;
            qrWindowRef.current = null;
        }
    };

    const handlePublicWindowOpen = (win: Window) => {
        publicWindowRef.current = win;
    };

    const handleQRWindowOpen = (win: Window) => {
        qrWindowRef.current = win;
    };
    
    
    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-900" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                        Admin Control Panel
                        </CardTitle>
                    </div>
                    {!activeSession ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <LaunchKaraokeSession
                                onUpdateSession={onUpdateSession}
                                adminId={adminInfo.admin_user_id}
                                onOpenPublicWindow={handlePublicWindowOpen}
                                adminSettings = {adminSettings}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <EndKaraokeSession
                                    onUpdateSession={onUpdateSession}
                                    adminId={adminInfo.admin_user_id}
                                    activeSession={activeSession}
                                />
                            </div>
                            <AdminQRCode
                                adminId={adminInfo.admin_user_id}
                                onOpenFullPage={handleQRWindowOpen}
                            />
                        </div>
                    )}

                    <NavigationContent
                        adminSettings = {adminSettings}
                        onUpdateAdminSettings = {onUpdateAdminSettings}
                        adminInfo = {adminInfo}
                        sessionLaunchTrigger = {sessionLaunchTrigger}
                        activeSession = {activeSession}
                    />
                </div>
            </CardHeader>
        </Card>
    );
}