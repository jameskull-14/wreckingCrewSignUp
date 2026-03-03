import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./QueuePanel";
import { Button } from "../shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shared/Dialog";
import { Plus } from "lucide-react";
import { Session } from "../../types/apiTypes/session";
import { Performer } from "../../types/apiTypes/performer";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import SignUpModal from "./SignUpModal";

interface SessionViewInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null
}

export default function SessionViewPanel({
    isAdmin,
    adminSettings,
}: SessionViewInterface){
    const [queuePanels, setQueuePanels] = useState();
    const [session, setSession] = useState<Session | null>(null);
    const [performers, setPerformers] = useState<Performer[]>([]);

    useEffect(()=>{
        const fetchSession = async () => {
            if (!adminSettings?.admin_user_id) return;

            try {
                const response = await fetch(`api/sessions?admin_user_id=${adminSettings.admin_user_id}&status=Active`);
                console.log('Session fetch URL:', `api/sessions?admin_user_id=${adminSettings.admin_user_id}&status=Active`);
                const data = await response.json();
                console.log('Session fetch response:', data);
                setSession(data[0] || null);
            } catch(error) {
                console.error('Failed to load session data: ', error);
            }
        }

        fetchSession();

        // Poll for session every 5 seconds to catch newly created sessions
        const interval = setInterval(fetchSession, 5000);
        return () => clearInterval(interval);
    }, [adminSettings?.admin_user_id])

    useEffect(() => {
        const fetchPerformers = async () => {
            if (!session?.session_id) return;

            try{
                const response = await fetch(`api/performers?session_id=${session.session_id}`)
                const data = await response.json();
                setPerformers(data)
            } catch(error){
                console.error('No Performers for this admin session')
            }
        }

        fetchPerformers();
    }, [session])

    return(
        <div>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                <CardHeader className="border-b border-amber-400/20">
                    <CardContent>
                        {performers.map((performer) => (
                            <QueuePanel
                                key={performer.performer_id}
                                isAdmin={isAdmin}
                                adminSettings={adminSettings}
                                performer={performer}
                            />
                        ))}
                    </CardContent>
                </CardHeader>
            </Card>
            <div className="flex justify-center mt-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="flex items-center gap-2"
                            style={{ backgroundColor: '#16a34a' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                        >
                            <Plus className="h-5 w-5" />
                            Sign Up
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-amber-400">Sign Up for Performance</DialogTitle>
                        </DialogHeader>
                        {!session && (
                            <div className="text-amber-400 text-center mb-4 p-4 bg-amber-400/10 rounded-md border border-amber-400/30">
                                ⚠️ No active session found. Please launch a karaoke session first.
                            </div>
                        )}
                        <SignUpModal
                            adminSettings={adminSettings}
                            session={session}
                            performers={performers}
                             />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}