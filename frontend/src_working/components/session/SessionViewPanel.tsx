import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./QueuePanel";
import { Button } from "../shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shared/Dialog";
import { Plus } from "lucide-react";
import { Performer } from "../../types/apiTypes/performer";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Session, SessionMode } from "../../types/apiTypes/session";
import SignUpModal from "./SignUpModal";
import { PerformerClient } from "../../api/apis/PerformerAPI";
import { PerformerSongSelection } from "../../types/apiTypes/performerSongSelection";
import { PerformerSongSelectionClient } from "../../api/frontendClient";
import { SessionClient } from "../../api/apis/SessionAPI";
import { useWebSocket } from "../../context/WebSocketContext";

interface SessionViewInterface{
    isAdmin: boolean,
    adminSettings: AdminUserSetting | null,
    sessionId: string
}

interface TimeSlotPanel {
    queueNumber: number;
    timeSlotStart: string;
    timeSlotEnd: string;
    performer: Performer | null;
}

export default function SessionViewPanel({
    isAdmin,
    adminSettings,
    sessionId
}: SessionViewInterface){
    const { subscribe } = useWebSocket();
    const [session, setSession] = useState<Session | null>(null);
    const [performers, setPerformers] = useState<Performer[]>([]);
    const [performerSongSelections, setPerformerSongSelections] = useState<PerformerSongSelection[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPerformer, setEditingPerformer] = useState<Performer | null>(null);


    const fetchSession = useCallback(async () => {
        if (!sessionId) {
            console.log('⚠️ fetchSession called but no sessionId');
            return;
        }

        try {
            const sessionData = await SessionClient.get(parseInt(sessionId));
            setSession(sessionData);
        } catch (error) {
            console.error('Error fetching session:', error);
        }
    }, [sessionId]);

    const fetchPerformers = useCallback(async () => {
        if (!sessionId) {
            console.log('⚠️ fetchPerformers called but no sessionId');
            return;
        }

        console.log('🔄 Fetching performers for session:', sessionId);
        try{
            const performerData = await PerformerClient.list(sessionId)
            // Sort by queue_number to preserve order
            const sortedPerformers = performerData.sort((a: Performer, b: Performer) => a.queue_number - b.queue_number)
            setPerformers(sortedPerformers)

            const songSelectionData = await PerformerSongSelectionClient.get(sessionId)
            setPerformerSongSelections(songSelectionData);
        } catch(error){
            console.error('No Performers for this admin session')
        }
    }, [sessionId])

    useEffect(() => {
        fetchSession();
        fetchPerformers();
    }, [sessionId, fetchSession, fetchPerformers])

    // Generate time slots based on session settings
    const generateTimeSlots = useCallback((): TimeSlotPanel[] => {
        if (!session || session.session_mode !== SessionMode.Time) {
            return [];
        }

        const { start_time, end_time, performance_time, changeover_time } = session;

        if (!start_time || !end_time || !performance_time) {
            console.warn('Time mode requires start_time, end_time, and performance_time');
            return [];
        }

        const slots: TimeSlotPanel[] = [];

        // Parse times (format: "HH:MM")
        const parseTime = (timeStr: string): number => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const formatTime = (totalMinutes: number): string => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        const startMinutes = parseTime(start_time);
        const endMinutes = parseTime(end_time);
        const performanceMinutes = parseTime(performance_time);
        const changeoverMinutes = changeover_time ? parseTime(changeover_time) : 0;
        const totalSlotTime = performanceMinutes + changeoverMinutes;

        let currentTime = startMinutes;
        let queueNumber = 1;

        while (currentTime + performanceMinutes <= endMinutes) {
            const slotStart = formatTime(currentTime);
            const slotEnd = formatTime(currentTime + performanceMinutes);

            // Find performer with this queue number
            const performer = performers.find(p => p.queue_number === queueNumber) || null;

            slots.push({
                queueNumber,
                timeSlotStart: slotStart,
                timeSlotEnd: slotEnd,
                performer
            });

            currentTime += totalSlotTime;
            queueNumber++;
        }

        return slots;
    }, [session, performers])

    // Subscribe to WebSocket updates for real-time performer changes
    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            console.log('📡 WebSocket message received in SessionViewPanel:', message);

            // When a performer is created, refresh the list
            if (message.type === 'performer_created') {
                console.log('🎤 New performer created, refreshing list...');
                fetchPerformers();
            }

            // When a performer is updated, refresh the list
            if (message.type === 'performer_updated') {
                console.log('✏️ Performer updated, refreshing list...');
                fetchPerformers();
            }

            // When a song selection is created, refresh the list
            if (message.type === 'song_selection_created') {
                console.log('🎵 Song selection created, refreshing list...');
                fetchPerformers();
            }

            // When a song selection is updated, refresh the list
            if (message.type === 'song_selection_updated') {
                console.log('🎵 Song selection updated, refreshing list...');
                fetchPerformers();
            }
        });

        // Cleanup: unsubscribe when component unmounts
        return unsubscribe;
    }, [subscribe, fetchPerformers])

    const handleEditPerformer = (performer: Performer) => {
        setEditingPerformer(performer);
        setIsDialogOpen(true);
    }

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPerformer(null);
        }
    }

    const timeSlots = generateTimeSlots();
    const isTimeMode = session?.session_mode === SessionMode.Time;

    return(
        <div style={{ maxWidth: '750px', margin: '2rem auto', padding: '0 1rem' }}>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                <CardHeader className="border-b border-amber-400/20">
                    <h2 className="text-3xl font-bold text-amber-400 text-center mb-4">Tonight's Schedule</h2>
                    <CardContent className="space-y-3">
                        {isTimeMode && timeSlots.length > 0 ? (
                            // Time mode: show all time slots
                            timeSlots.map((slot) => (
                                <QueuePanel
                                    key={slot.queueNumber}
                                    isAdmin={isAdmin}
                                    adminSettings={adminSettings}
                                    performer={slot.performer}
                                    performerSongSelections={performerSongSelections}
                                    onEdit={slot.performer ? () => handleEditPerformer(slot.performer!) : undefined}
                                    queueNumber={slot.queueNumber}
                                    timeSlotStart={slot.timeSlotStart}
                                    timeSlotEnd={slot.timeSlotEnd}
                                    session={session}
                                    sessionId={sessionId}
                                    performers={performers}
                                    onPerformerCreated={fetchPerformers}
                                />
                            ))
                        ) : (
                            // Order mode: show only signed-up performers
                            performers.map((performer) => (
                                <QueuePanel
                                    key={performer.performer_id}
                                    isAdmin={isAdmin}
                                    adminSettings={adminSettings}
                                    performer={performer}
                                    performerSongSelections={performerSongSelections}
                                    onEdit={() => handleEditPerformer(performer)}
                                    queueNumber={performer.queue_number}
                                    session={session}
                                    sessionId={sessionId}
                                    performers={performers}
                                    onPerformerCreated={fetchPerformers}
                                />
                            ))
                        )}
                    </CardContent>
                </CardHeader>
            </Card>
            <div className="flex justify-center mt-4">
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
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
                    <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30 max-w-lg" hideClose>
                        <DialogHeader>
                            <DialogTitle className="text-amber-400">
                                {editingPerformer ? 'Edit Performance' : 'Sign Up for Performance'}
                            </DialogTitle>
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
                            onPerformerCreated={() => {
                                fetchPerformers();
                                handleDialogChange(false); // Close dialog and reset edit state
                            }}
                            editMode={!!editingPerformer}
                            performerToEdit={editingPerformer || undefined}
                            performerSongSelections={performerSongSelections}
                             />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}