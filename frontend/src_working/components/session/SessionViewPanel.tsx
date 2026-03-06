import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./QueuePanel";
import { Button } from "../shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shared/Dialog";
import { Plus } from "lucide-react";
import { Session } from "../../types/apiTypes/session";
import { Performer, PerformerStatus } from "../../types/apiTypes/performer";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import SignUpModal from "./SignUpModal";
import { SessionClient } from "../../api/apis/SessionAPI";
import { PerformerClient } from "../../api/apis/PerformerAPI";
import { PerformerSongSelection } from "../../types/apiTypes/performerSongSelection";
import { PerformerSongSelectionClient } from "../../api/frontendClient";

interface SessionViewInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null,
    sessionId: string
}

export default function SessionViewPanel({
    isAdmin,
    adminSettings,
    sessionId
}: SessionViewInterface){
    const [queuePanels, setQueuePanels] = useState();
    const [performers, setPerformers] = useState<Performer[]>([]);
    const [performerSongSelections, setPerformerSongSelections] = useState<PerformerSongSelection[]>([]);


    const fetchPerformers = async () => {
        if (!sessionId) return;

        try{
            const performerData = await PerformerClient.list(sessionId)
            setPerformers(performerData)

            const songSelectionData = await PerformerSongSelectionClient.get(sessionId)
            setPerformerSongSelections(songSelectionData);
        } catch(error){
            console.error('No Performers for this admin session')
        }
    }

    useEffect(() => {
        fetchPerformers();
    }, [sessionId])

    return(
        <div>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                <CardHeader className="border-b border-amber-400/20">
                    <CardContent>
                        {performers.map((performer) => (
                            <QueuePanel
                                isAdmin={isAdmin}
                                adminSettings={adminSettings}
                                performer={performer}
                                performerSongSelections={performerSongSelections}
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
                        {!sessionId && (
                            <div className="text-amber-400 text-center mb-4 p-4 bg-amber-400/10 rounded-md border border-amber-400/30">
                                ⚠️ No active session found. Please launch a karaoke session first.
                            </div>
                        )}
                        <SignUpModal
                            adminSettings={adminSettings}
                            sessionId={sessionId}
                            performers={performers}
                            onPerformerCreated={fetchPerformers}
                             />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}