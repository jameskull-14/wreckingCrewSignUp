import { useState } from "react";
import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Button } from "../shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../shared/Dialog";
import { Pencil, Plus } from "lucide-react";
import { PerformerType, PerformerStatus } from "../../types/apiTypes/performer";
import { SessionMode } from "../../types/apiTypes/session";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shared/Select";
import { PerformerClient, PerformerSongSelectionClient, SessionClient } from "../../api/frontendClient";
import SignUpModal from "./SignUpModal";

export default function QueuePanel({
    isAdmin,
    adminSettings,
    performer,
    performerSongSelections,
    onEdit,
    queueNumber,
    timeSlotStart,
    timeSlotEnd,
    session,
    sessionId,
    performers,
    onPerformerCreated,
    isFeaturedAct,
    featuredActName,
    featuredActStatus,
    featuredActLinkUrl,
    featuredActLinkText
}: QueuePanelInterface){
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const mergePerformerInfo = performer
        ? performerSongSelections
            .filter(selection => selection.performer_id === performer.performer_id)
            .sort((a, b) => parseInt(a.selection_order) - parseInt(b.selection_order))
        : [];

    const isTimeMode = session?.session_mode === SessionMode.Time;

    const displayName = isFeaturedAct
        ? featuredActName || "Featured Act"
        : !performer || performer.performer_name === ""
        ? "Available Time Slot"
        : performer.performer_type === PerformerType.group
        ? `Band: ${performer.performer_name}`
        : performer.performer_name

    // Format time slot for display (convert 24-hour to 12-hour format)
    const formatTimeSlot = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    const timeSlotDisplay = timeSlotStart && timeSlotEnd
        ? `${formatTimeSlot(timeSlotStart)} - ${formatTimeSlot(timeSlotEnd)}`
        : null

    const handleStatusChange = async (newStatus: string) => {
        if (!performer) return;
        try {
            await PerformerClient.update(performer.performer_id, {
                status: newStatus as PerformerStatus
            });
            // Refetch performers to update the UI immediately
            if (onPerformerCreated) {
                onPerformerCreated();
            }
        } catch (error) {
            console.error("Error updating performer status:", error);
        }
    };

    const handleSongStatusChange = async (selectionId: number, newStatus: string) => {
        if (!performer) return;
        try {
            await PerformerSongSelectionClient.update(selectionId, {
                status: newStatus as PerformerStatus
            });

            // If a song is marked as performing, also mark the performer as performing
            if (newStatus === PerformerStatus.performing && performer.status !== PerformerStatus.performing) {
                await PerformerClient.update(performer.performer_id, {
                    status: PerformerStatus.performing
                });
            }

            // Refetch performers to update the UI immediately
            if (onPerformerCreated) {
                onPerformerCreated();
            }
        } catch (error) {
            console.error("Error updating song status:", error);
        }
    };

    const handleFeaturedActStatusChange = async (newStatus: string) => {
        if (!session) return;
        try {
            await SessionClient.update(session.session_id, {
                featured_act_status: newStatus
            });

            // Refetch session to update the UI immediately
            if (onPerformerCreated) {
                onPerformerCreated();
            }
        } catch (error) {
            console.error("Error updating featured act status:", error);
        }
    };

    // Determine styling based on status
    const isSkipped = performer?.status === PerformerStatus.skipped;
    const isCompleted = performer?.status === PerformerStatus.completed;
    const isGreyedOut = isSkipped || isCompleted;

    const getStatusColor = (status: PerformerStatus) => {
        switch (status) {
            case PerformerStatus.waiting:
                return 'text-yellow-400';
            case PerformerStatus.performing:
                return 'text-green-400';
            case PerformerStatus.completed:
                return 'text-gray-400';
            case PerformerStatus.skipped:
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusLabel = (status: PerformerStatus) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return(
        <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 ${isFeaturedAct ? 'border-purple-500/50' : 'border-amber-400/30'} ${isGreyedOut ? 'opacity-50' : ''}`}>
            <CardHeader className="border-b border-amber-400/20">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap min-w-0">
                                {isFeaturedAct && (
                                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/50">
                                        ⭐ FEATURED ACT
                                    </span>
                                )}
                                <CardTitle className="text-xl sm:text-2xl font-bold text-white break-words min-w-0" style={isSkipped ? { textDecoration: 'line-through' } : {}}>
                                    {displayName}
                                </CardTitle>
                                {timeSlotDisplay && (
                                    <span className="text-gray-400 text-sm font-medium whitespace-nowrap">
                                        {timeSlotDisplay}
                                    </span>
                                )}
                            </div>
                            {performer && !isFeaturedAct && (adminSettings?.show_performer_status ?? true) && (
                                <>
                                    {isAdmin ? (
                                        <Select
                                            value={performer.status}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger className={`w-36 sm:w-40 bg-gray-900/50 border-amber-400/30 ${getStatusColor(performer.status)}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={PerformerStatus.waiting}>Waiting</SelectItem>
                                                <SelectItem value={PerformerStatus.performing}>Performing</SelectItem>
                                                <SelectItem value={PerformerStatus.completed}>Completed</SelectItem>
                                                <SelectItem value={PerformerStatus.skipped}>Skipped</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className={`text-sm font-semibold ${getStatusColor(performer.status)}`}>
                                            {getStatusLabel(performer.status)}
                                        </span>
                                    )}
                                </>
                            )}
                            {isFeaturedAct && isAdmin && (adminSettings?.show_performer_status ?? true) && (
                                <Select
                                    value={featuredActStatus || PerformerStatus.waiting}
                                    onValueChange={handleFeaturedActStatusChange}
                                >
                                    <SelectTrigger className={`w-36 sm:w-40 bg-gray-900/50 border-purple-500/30 ${getStatusColor((featuredActStatus || PerformerStatus.waiting) as PerformerStatus)}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PerformerStatus.waiting}>Waiting</SelectItem>
                                        <SelectItem value={PerformerStatus.performing}>Performing</SelectItem>
                                        <SelectItem value={PerformerStatus.completed}>Completed</SelectItem>
                                        <SelectItem value={PerformerStatus.skipped}>Skipped</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            {isFeaturedAct && !isAdmin && (adminSettings?.show_performer_status ?? true) && (
                                <span className={`text-sm font-semibold ${getStatusColor((featuredActStatus || PerformerStatus.waiting) as PerformerStatus)}`}>
                                    {getStatusLabel((featuredActStatus || PerformerStatus.waiting) as PerformerStatus)}
                                </span>
                            )}
                        </div>
                    </div>
                    {isAdmin && onEdit && performer && !isFeaturedAct && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-md transition-colors"
                            title="Edit performer"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <CardContent>
                    {isFeaturedAct ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-purple-400 italic">Special performance - not available for signup</p>
                            {(() => {
                                console.log('🔗 Featured Act Link Debug:', {
                                    featuredActLinkUrl,
                                    featuredActLinkText,
                                    hasUrl: !!featuredActLinkUrl,
                                    hasText: !!featuredActLinkText
                                });
                                return null;
                            })()}
                            {featuredActLinkUrl && featuredActLinkText && (
                                <a
                                    href={featuredActLinkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline hover:text-blue-300 mt-2"
                                >
                                    {featuredActLinkText}
                                </a>
                            )}
                        </div>
                    ) : !performer ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-gray-400 italic mb-3">No one signed up yet</p>
                            {isTimeMode && (
                                <>
                                    <Button
                                        onClick={() => setIsSignUpOpen(true)}
                                        className="flex items-center gap-2"
                                        style={{ backgroundColor: '#16a34a' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                    >
                                        <Plus className="h-5 w-5" />
                                        Sign Up for This Slot
                                    </Button>

                                    <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                                        <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30 max-w-lg" hideClose>
                                            <DialogHeader>
                                                <DialogTitle className="text-amber-400">
                                                    Sign Up for {timeSlotDisplay ? timeSlotDisplay : `Position #${queueNumber}`}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <SignUpModal
                                                adminSettings={adminSettings}
                                                sessionId={sessionId}
                                                performers={performers}
                                                onPerformerCreated={() => {
                                                    if (onPerformerCreated) {
                                                        onPerformerCreated();
                                                    }
                                                    setIsSignUpOpen(false);
                                                }}
                                                editMode={false}
                                                performerSongSelections={performerSongSelections}
                                                preselectedQueueNumber={queueNumber}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    ) : mergePerformerInfo.length > 0 ? (
                        <div className="space-y-3">
                            {mergePerformerInfo.map((selection, index) => {
                                const songStatus = selection.status as PerformerStatus;
                                const isSongSkipped = songStatus === PerformerStatus.skipped;
                                const isSongCompleted = songStatus === PerformerStatus.completed;

                                return (
                                    <div key={selection.performer_selection_id} className={`${isSongSkipped || isSongCompleted ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-amber-400 text-sm">Song {index + 1}:</div>
                                            {(adminSettings?.show_song_status ?? true) && (
                                            isAdmin ? (
                                                <Select
                                                    value={songStatus}
                                                    onValueChange={(value) => handleSongStatusChange(selection.performer_selection_id, value)}
                                                >
                                                    <SelectTrigger className={`w-32 bg-gray-900/50 border-amber-400/30 text-xs ${getStatusColor(songStatus)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={PerformerStatus.waiting}>Waiting</SelectItem>
                                                        <SelectItem value={PerformerStatus.performing}>Performing</SelectItem>
                                                        <SelectItem value={PerformerStatus.completed}>Completed</SelectItem>
                                                        <SelectItem value={PerformerStatus.skipped}>Skipped</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span className={`text-xs font-semibold ${getStatusColor(songStatus)}`}>
                                                    {getStatusLabel(songStatus)}
                                                </span>
                                            )
                                        )}
                                        </div>
                                        <div className="text-white" style={isSongSkipped ? { textDecoration: 'line-through' } : {}}>
                                            <span className="sm:hidden">
                                                <div>{selection.song_title || 'Unknown Song'} -</div>
                                                <div>{selection.artist || 'Unknown Artist'}</div>
                                            </span>
                                            <span className="hidden sm:inline">
                                                {selection.song_title || 'Unknown Song'} - {selection.artist || 'Unknown Artist'}
                                            </span>
                                        </div>
                                        {adminSettings?.allow_instrument_use && (
                                            <div className="text-sm text-gray-400">
                                                {selection.is_singing ? "Singing" : ""}
                                                {selection.instrument ? ` - ${selection.instrument}` : ""}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">No songs selected</p>
                    )}
                </CardContent>
            </CardHeader>
        </Card>
    )
}