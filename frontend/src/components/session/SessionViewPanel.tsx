import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./QueuePanel";
import { Button } from "../shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shared/Dialog";
import { Plus } from "lucide-react";
import { Performer } from "../../types/apiTypes/performer";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Session, SessionMode } from "../../types/apiTypes/session";
import { WebSocketMessageType } from "../../types/apiTypes/websocket";
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
    isFeaturedAct?: boolean;
    featuredActName?: string;
    featuredActStatus?: string;
    featuredActLinkUrl?: string;
    featuredActLinkText?: string;
    isPartial?: boolean;
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

    const refetchAll = useCallback(async () => {
        await fetchSession();
        await fetchPerformers();
    }, [fetchSession, fetchPerformers])

    useEffect(() => {
        fetchSession();
        fetchPerformers();
    }, [sessionId, fetchSession, fetchPerformers])

    // Generate time slots based on session settings with dynamic durations
    const generateTimeSlots = useCallback((): TimeSlotPanel[] => {
        if (!session || session.session_mode !== SessionMode.Time) {
            return [];
        }

        const {
            start_time, end_time, performance_time, changeover_time, songs_per_performer,
            featured_act_name, featured_act_start_time, featured_act_end_time,
            featured_act_status, featured_act_link_url, featured_act_link_text
        } = session;

        if (!start_time || !end_time || !performance_time) {
            return [];
        }

        const parseTime = (t: string): number => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const formatTime = (mins: number): string => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const startMins = parseTime(start_time);
        const endMins = parseTime(end_time);
        const perfMins = parseTime(performance_time);
        const changeoverMins = changeover_time ? parseTime(changeover_time) : 0;
        const fullSlot = perfMins + changeoverMins;
        const songsPerPerformer = songs_per_performer || 1;
        const timePerSong = perfMins / songsPerPerformer;

        let featActStart: number | null = null;
        let featActEnd: number | null = null;
        if (featured_act_name && featured_act_start_time && featured_act_end_time) {
            featActStart = parseTime(featured_act_start_time);
            featActEnd = parseTime(featured_act_end_time);
        }

        // Pre-compute the static start time for each queue number (original sequential layout)
        const staticStartByQueueNum = new Map<number, number>();
        {
            let t = startMins;
            let qNum = 1;
            while (t + perfMins <= endMins) {
                if (featActStart !== null && featActEnd !== null &&
                    t < featActEnd && t + perfMins > featActStart) {
                    t = featActEnd;
                    continue;
                }
                staticStartByQueueNum.set(qNum, t);
                t += fullSlot;
                qNum++;
            }
        }

        const sortedPerformers = [...performers].sort((a, b) => a.queue_number - b.queue_number);
        const takenQueueNums = new Set(performers.map(p => p.queue_number));
        const slots: TimeSlotPanel[] = [];
        let currentTime = startMins;
        let dynamicQueueNum = 1;

        // Fill the time range [from, to) with dynamic empty slots, skipping the featured act.
        // Returns the next queue number to assign.
        const fillGap = (from: number, to: number, startQNum: number): number => {
            let t = from;
            let qNum = startQNum;

            while (t < to) {
                // Jump over the featured act block if we land inside it
                if (featActStart !== null && featActEnd !== null && t >= featActStart && t < featActEnd) {
                    t = featActEnd;
                    continue;
                }

                // Effective upper bound for this iteration: stop at featured act start if it falls within the gap
                const upper = (featActStart !== null && featActEnd !== null &&
                    featActStart > t && featActStart < to)
                    ? featActStart
                    : to;

                const remaining = upper - t;

                if (remaining >= perfMins) {
                    while (takenQueueNums.has(qNum)) qNum++;
                    slots.push({
                        queueNumber: qNum,
                        timeSlotStart: formatTime(t),
                        timeSlotEnd: formatTime(t + perfMins),
                        performer: null
                    });
                    takenQueueNums.add(qNum);
                    qNum++;
                    t += fullSlot;
                } else if (remaining >= timePerSong) {
                    const partialSongs = Math.floor(remaining / timePerSong);
                    slots.push({
                        queueNumber: 0,
                        timeSlotStart: formatTime(t),
                        timeSlotEnd: formatTime(t + partialSongs * timePerSong),
                        performer: null,
                        isPartial: true
                    });
                    if (upper === featActStart && featActEnd !== null) {
                        t = featActEnd;
                    } else {
                        break;
                    }
                } else {
                    if (upper === featActStart && featActEnd !== null) {
                        t = featActEnd;
                    } else {
                        break;
                    }
                }
            }

            return qNum;
        };

        for (const performer of sortedPerformers) {
            const staticStart = staticStartByQueueNum.get(performer.queue_number);
            if (staticStart === undefined) continue;

            // Fill the gap between currentTime and this performer's reserved start
            if (currentTime < staticStart) {
                dynamicQueueNum = fillGap(currentTime, staticStart, dynamicQueueNum);
            }

            // How many songs has this performer actually selected?
            const songCount = performerSongSelections.filter(
                s => s.performer_id === performer.performer_id
            ).length;
            const effectiveSongs = songCount > 0
                ? Math.min(songCount, songsPerPerformer)
                : songsPerPerformer;
            const effectivePerformanceDuration = effectiveSongs * timePerSong;

            const performerStart = Math.max(currentTime, staticStart);
            slots.push({
                queueNumber: performer.queue_number,
                timeSlotStart: formatTime(performerStart),
                timeSlotEnd: formatTime(performerStart + effectivePerformanceDuration),
                performer
            });

            currentTime = performerStart + effectivePerformanceDuration + changeoverMins;
            dynamicQueueNum = performer.queue_number + 1;
        }

        // Fill any remaining time after the last performer
        fillGap(currentTime, endMins, dynamicQueueNum);

        // Insert featured act at its fixed chronological position
        if (featured_act_name && featured_act_start_time && featured_act_end_time) {
            const featuredActSlot: TimeSlotPanel = {
                queueNumber: 0,
                timeSlotStart: featured_act_start_time,
                timeSlotEnd: featured_act_end_time,
                performer: null,
                isFeaturedAct: true,
                featuredActName: featured_act_name,
                featuredActStatus: featured_act_status || undefined,
                featuredActLinkUrl: featured_act_link_url || undefined,
                featuredActLinkText: featured_act_link_text || undefined
            };

            const featStart = parseTime(featured_act_start_time);
            const insertIndex = slots.findIndex(slot => parseTime(slot.timeSlotStart) > featStart);
            if (insertIndex === -1) {
                slots.push(featuredActSlot);
            } else {
                slots.splice(insertIndex, 0, featuredActSlot);
            }
        }

        return slots;
    }, [session, performers, performerSongSelections])

    // Subscribe to WebSocket updates for real-time performer changes
    useEffect(() => {
        const unsubscribe = subscribe((message) => {

            // When a performer is created, refresh the list
            if (message.type === WebSocketMessageType.PERFORMER_CREATED) {
                fetchPerformers();
            }

            // When a performer is updated, refresh the list
            if (message.type === WebSocketMessageType.PERFORMER_UPDATED) {
                fetchPerformers();
            }

            // When a performer is deleted (slot cleared), refresh the list
            if (message.type === WebSocketMessageType.PERFORMER_DELETED) {
                fetchPerformers();
            }

            // When a song selection is created, refresh the list
            if (message.type === WebSocketMessageType.SONG_SELECTION_CREATED) {
                fetchPerformers();
            }

            // When a song selection is updated, refresh the list
            if (message.type === WebSocketMessageType.SONG_SELECTION_UPDATED) {
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
                            timeSlots.map((slot, index) => (
                                <QueuePanel
                                    key={slot.isFeaturedAct ? `featured-act` : slot.isPartial ? `partial-${index}` : slot.queueNumber}
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
                                    onPerformerCreated={slot.isFeaturedAct ? refetchAll : fetchPerformers}
                                    isFeaturedAct={slot.isFeaturedAct}
                                    featuredActName={slot.featuredActName}
                                    featuredActStatus={slot.featuredActStatus}
                                    featuredActLinkUrl={slot.featuredActLinkUrl}
                                    featuredActLinkText={slot.featuredActLinkText}
                                    isPartial={slot.isPartial}
                                />
                            ))
                        ) : (
                            // Order mode: featured act first (if set), then signed-up performers
                            <>
                                {session?.featured_act_name && (
                                    <QueuePanel
                                        key="featured-act"
                                        isAdmin={isAdmin}
                                        adminSettings={adminSettings}
                                        performer={null}
                                        performerSongSelections={performerSongSelections}
                                        queueNumber={0}
                                        timeSlotStart={session.featured_act_start_time}
                                        timeSlotEnd={session.featured_act_end_time}
                                        session={session}
                                        sessionId={sessionId}
                                        performers={performers}
                                        onPerformerCreated={refetchAll}
                                        isFeaturedAct={true}
                                        featuredActName={session.featured_act_name}
                                        featuredActStatus={session.featured_act_status || undefined}
                                        featuredActLinkUrl={session.featured_act_link_url || undefined}
                                        featuredActLinkText={session.featured_act_link_text || undefined}
                                    />
                                )}
                                {performers.map((performer) => (
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
                                ))}
                            </>
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