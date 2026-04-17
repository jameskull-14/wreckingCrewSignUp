import { useState, useEffect } from "react";
import { Input } from "../shared/Input";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Performer, PerformerCreate, PerformerStatus, PerformerUpdate, PerformerType } from "../../types/apiTypes/performer";
import { PerformerSongSelectionCreate, PerformerSongSelection } from "../../types/apiTypes/performerSongSelection";
import { INSTRUMENTS } from "../../types/apiTypes/instrument";
import { Button } from "../shared/Button";
import SongSelectionModal from "./SongSelectionModal";
import { PerformerClient, PerformerSongSelectionClient } from "../../api/frontendClient";

interface SignUpPanelInterface{
    adminSettings: AdminUserSetting | null,
    sessionId: string,
    performers: Performer[],
    onPerformerCreated?: () => void,
    editMode?: boolean,
    performerToEdit?: Performer,
    performerSongSelections?: PerformerSongSelection[],
    preselectedQueueNumber?: number
}

interface SongSlot {
    song: any | null;
    isSinging: boolean;
    instrument: string;
}

export default function SignUpModal({
    adminSettings,
    sessionId,
    performers,
    onPerformerCreated,
    editMode = false,
    performerToEdit,
    performerSongSelections = [],
    preselectedQueueNumber
}: SignUpPanelInterface){
    const songsPerPerformer = adminSettings?.songs_per_performer || 1;
    const allowInstrumentUse = adminSettings?.allow_instrument_use || false;

    // Initialize state based on edit mode
    const [performerName, setPerformerName] = useState(editMode && performerToEdit ? performerToEdit.performer_name : "");
    const [performerType, setPerformerType] = useState<PerformerType>(
        editMode && performerToEdit ? performerToEdit.performer_type : PerformerType.individual
    );
    const [showSuccess, setShowSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);

    // Initialize song slots - either from existing data or empty
    const initializeSongSlots = (): SongSlot[] => {
        if (editMode && performerToEdit) {
            const existingSelections = performerSongSelections
                .filter(sel => sel.performer_id === performerToEdit.performer_id)
                .sort((a, b) => parseInt(a.selection_order) - parseInt(b.selection_order));

            const slots: SongSlot[] = [];
            for (let i = 0; i < songsPerPerformer; i++) {
                const selection = existingSelections[i];
                if (selection) {
                    slots.push({
                        song: {
                            song_id: selection.song_id,
                            song_title: selection.song_title,
                            artist: selection.artist
                        },
                        isSinging: selection.is_singing,
                        instrument: selection.instrument || ""
                    });
                } else {
                    slots.push({
                        song: null,
                        isSinging: true,
                        instrument: ""
                    });
                }
            }
            return slots;
        }
        return Array.from({ length: songsPerPerformer }, () => ({
            song: null,
            isSinging: true,
            instrument: ""
        }));
    };

    const [songSlots, setSongSlots] = useState<SongSlot[]>(initializeSongSlots());

    // Reset form when switching between edit and create mode
    useEffect(() => {
        if (editMode && performerToEdit) {
            setPerformerName(performerToEdit.performer_name);
            setPerformerType(performerToEdit.performer_type);
            setSongSlots(initializeSongSlots());
        } else {
            setPerformerName("");
            setPerformerType(PerformerType.individual);
            setSongSlots(Array.from({ length: songsPerPerformer }, () => ({
                song: null,
                isSinging: true,
                instrument: ""
            })));
        }
    }, [editMode, performerToEdit?.performer_id]);

    // Auto-close after 2 seconds when success is shown
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false);
                onPerformerCreated?.();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess, onPerformerCreated]);

    const nextQueueNumber = preselectedQueueNumber || (
        performers.length > 0 ?
        Math.max(...performers.map(p =>p.queue_number)) + 1
        : 1
    );

    const updateSongSlot = (index: number, updates: Partial<SongSlot>) => {
        setSongSlots(prev => {
            const newSlots = [...prev];
            newSlots[index] = { ...newSlots[index], ...updates };
            return newSlots;
        });
    };

    const handleAddSongClick = (index: number) => {
        setCurrentSlotIndex(index);
        setIsModalOpen(true);
    };

    const handleSongSelected = (song: any) => {
        if (currentSlotIndex !== null) {
            updateSongSlot(currentSlotIndex, { song });
        }
    };

    // Get list of already selected song IDs for this performer
    const getUnavailableSongIds = () => {
        // Always include songs selected by this performer in their current slots
        const currentPerformerSongIds = songSlots
            .filter(slot => slot.song !== null)
            .map(slot => slot.song.song_id);

        // If song reuse is not allowed, also include all songs selected by other performers
        if (adminSettings && !adminSettings.allow_song_reuse) {
            const allSelectedSongIds = performerSongSelections
                .filter(selection => {
                    // In edit mode, exclude selections from the performer being edited
                    if (editMode && performerToEdit) {
                        return selection.performer_id !== performerToEdit.performer_id;
                    }
                    // In create mode, include all selections
                    return true;
                })
                .map(selection => selection.song_id);

            // Combine and remove duplicates
            return [...new Set([...currentPerformerSongIds, ...allSelectedSongIds])];
        }

        return currentPerformerSongIds;
    };

    const handleNewPeformer = async (name: string, sessionId: string) => {
        console.log('🎤 handleNewPeformer called:', { name, sessionId, nextQueueNumber });
        try {
            const session_Id = parseInt(sessionId);
            console.log('📝 Parsed sessionId:', session_Id);

            // Create the performer first
            const performerData: PerformerCreate = {
                performer_name: name,
                performer_username: "Guest",
                queue_number: nextQueueNumber,
                session_id: session_Id,
                status: PerformerStatus.waiting,
                performer_type: performerType
            }
            console.log('📤 Sending performer data:', performerData);

            const createdPerformer = await PerformerClient.create(performerData);
            console.log('✅ Performer created:', createdPerformer);

            // Create performer_song_selection entries for each song slot that has a song
            let selectionOrder = 1;
            for (const slot of songSlots) {
                if (slot.song) {
                    const songSelection: PerformerSongSelectionCreate = {
                        performer_id: createdPerformer.performer_id,
                        song_id: slot.song.song_id,
                        selection_order: selectionOrder.toString(),
                        is_singing: slot.isSinging,
                        instrument: slot.instrument || undefined,
                        status: PerformerStatus.waiting
                    };

                    try {
                        await PerformerSongSelectionClient.create(songSelection);
                        console.log(`Song selection ${selectionOrder} created for song:`, slot.song.song_title);
                        selectionOrder++;
                    } catch (selectionError: any) {
                        // If song selection fails, delete the performer and show error
                        console.error('❌ Error creating song selection:', selectionError);
                        await PerformerClient.delete(createdPerformer.performer_id);

                        // Extract error message from API response
                        let errorMessage = 'Failed to add song selection';
                        if (selectionError && typeof selectionError === 'object') {
                            if ('detail' in selectionError && typeof selectionError.detail === 'string') {
                                errorMessage = selectionError.detail;
                            } else if (selectionError.message) {
                                errorMessage = selectionError.message;
                            }
                        }

                        alert(errorMessage);
                        return; // Exit the function
                    }
                }
            }

            // Reset form after successful submission
            setPerformerName("");
            setSongSlots(Array.from({ length: songsPerPerformer }, () => ({
                song: null,
                isSinging: true,
                instrument: ""
            })));

            // Show success message with auto-close
            setShowSuccess(true);
        } catch (error) {
            console.error('❌ Error creating performer:', error);

            // Extract error message from API response
            let errorMessage = 'Failed to sign up';
            if (error && typeof error === 'object') {
                if ('detail' in error && typeof (error as any).detail === 'string') {
                    errorMessage = (error as any).detail;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            alert(errorMessage);
        }
    }

    const handleUpdatePerformer = async (name: string, sessionId: string) => {
        if (!performerToEdit) return;

        console.log('✏️ handleUpdatePerformer called:', { name, sessionId, performerId: performerToEdit.performer_id });
        try {

            // Update the performer
            const performerUpdateData: PerformerUpdate = {
                performer_name: name,
                performer_username: "Guest",
                queue_number: performerToEdit.queue_number,
                status: performerToEdit.status,
                performer_type: performerType
            };
            console.log('📤 Updating performer data:', performerUpdateData);

            await PerformerClient.update(performerToEdit.performer_id, performerUpdateData);
            console.log('✅ Performer updated');

            // Get existing song selections for this performer
            const existingSelections = performerSongSelections
                .filter(sel => sel.performer_id === performerToEdit.performer_id)
                .sort((a, b) => parseInt(a.selection_order) - parseInt(b.selection_order));

            // Delete all existing song selections
            for (const selection of existingSelections) {
                await PerformerSongSelectionClient.delete(selection.performer_selection_id);
            }
            console.log('🗑️ Deleted existing song selections');

            // Create new song selections
            let selectionOrder = 1;
            for (const slot of songSlots) {
                if (slot.song) {
                    const songSelection: PerformerSongSelectionCreate = {
                        performer_id: performerToEdit.performer_id,
                        song_id: slot.song.song_id,
                        selection_order: selectionOrder.toString(),
                        is_singing: slot.isSinging,
                        instrument: slot.instrument || undefined,
                        status: performerToEdit.status
                    };

                    try {
                        await PerformerSongSelectionClient.create(songSelection);
                        console.log(`Song selection ${selectionOrder} created for song:`, slot.song.song_title);
                        selectionOrder++;
                    } catch (selectionError: any) {
                        console.error('❌ Error creating song selection:', selectionError);
                        let errorMessage = 'Failed to add song selection';
                        if (selectionError && typeof selectionError === 'object') {
                            if ('detail' in selectionError && typeof selectionError.detail === 'string') {
                                errorMessage = selectionError.detail;
                            } else if (selectionError.message) {
                                errorMessage = selectionError.message;
                            }
                        }
                        alert(errorMessage);
                        return;
                    }
                }
            }

            // Show success message with auto-close
            setShowSuccess(true);
        } catch (error) {
            console.error('❌ Error updating performer:', error);

            let errorMessage = 'Failed to update performer';
            if (error && typeof error === 'object') {
                if ('detail' in error && typeof (error as any).detail === 'string') {
                    errorMessage = (error as any).detail;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
            }

            alert(errorMessage);
        }
    }

    const handleSubmit = () => {
        if (!sessionId || !performerName.trim()) return;

        if (editMode) {
            handleUpdatePerformer(performerName, sessionId);
        } else {
            handleNewPeformer(performerName, sessionId);
        }
    }

    return (
        <div className="space-y-4 relative">
            {/* Success Popup Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center rounded-lg">
                    <div className="bg-gray-800 border-2 border-green-500 rounded-lg shadow-2xl p-8 text-center space-y-4 min-w-[320px]">
                        <div className="text-6xl">✓</div>
                        <div className="text-2xl font-bold text-green-400">Successfully Signed Up!</div>
                        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                            <div
                                className="h-full bg-green-500 animate-progress"
                                style={{
                                    animation: 'progress 2s linear forwards'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <button
                        type="button"
                        onClick={() => setPerformerType(PerformerType.individual)}
                        className={`text-sm font-medium transition-colors ${
                            performerType === PerformerType.individual
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        Performer Name
                    </button>
                    <button
                        type="button"
                        onClick={() => setPerformerType(PerformerType.group)}
                        className={`text-sm font-medium transition-colors ${
                            performerType === PerformerType.group
                                ? 'text-white'
                                : 'text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        Band Name
                    </button>
                </div>
                <Input
                    type="text"
                    placeholder={performerType === PerformerType.group ? "Band Name" : "Performer Name"}
                    value={performerName}
                    onChange={(e) => setPerformerName(e.target.value)}
                    className="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
                />
            </div>

            {/* Column Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: allowInstrumentUse ? '2fr 80px 160px' : '2fr 80px' }}>
                <div className="text-amber-400 text-sm font-semibold">Song Search</div>
                <div className="text-amber-400 text-sm font-semibold text-center">Singing?</div>
                {allowInstrumentUse && (
                    <div className="text-amber-400 text-sm font-semibold">Instrument?</div>
                )}
            </div>

            {/* Song Rows */}
            {songSlots.map((slot, index) => (
                <div key={index} className="grid gap-4 items-start" style={{ gridTemplateColumns: allowInstrumentUse ? '2fr 80px 160px' : '2fr 80px' }}>
                    {/* Song Search Column */}
                    <div className="max-w-md">
                        {slot.song ? (
                            <div className="flex items-center justify-between p-2 bg-gray-800 border-2 border-amber-400/30 rounded-md">
                                <div>
                                    <p className="text-white font-medium text-sm">{slot.song.song_title}</p>
                                    <p className="text-gray-400 text-xs">{slot.song.artist}</p>
                                </div>
                                <button
                                    onClick={() => updateSongSlot(index, { song: null })}
                                    className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 ml-2"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => handleAddSongClick(index)}
                                className="w-full flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#16a34a' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                            >
                                <span className="text-xl">+</span>
                                <span>Add Song</span>
                            </Button>
                        )}
                    </div>

                    {/* Singing Column */}
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            id={`singing-${index}`}
                            checked={slot.isSinging}
                            onChange={(e) => updateSongSlot(index, { isSinging: e.target.checked })}
                            className="rounded border-2 border-amber-400/30 cursor-pointer focus:ring-0 focus:outline-none"
                            style={{
                                width: '40px',
                                height: '40px',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundColor: '#1f2937 !important',
                                backgroundImage: slot.isSinging ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='rgb(34 197 94)' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundSize: '70% 70%'
                            }}
                        />
                    </div>

                    {/* Instrument Column */}
                    {allowInstrumentUse && (
                        <div style={{ width: '160px' }}>
                            <select
                                value={slot.instrument}
                                onChange={(e) => updateSongSlot(index, { instrument: e.target.value })}
                                className="w-full py-2 px-3 rounded-md bg-gray-800 border-2 border-amber-400/30 text-white text-sm focus:outline-none focus:border-amber-400"
                            >
                                <option value="">No instrument</option>
                                {INSTRUMENTS.map((instrument) => (
                                    <option key={instrument} value={instrument}>
                                        {instrument}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ))}

            <div className="text-white text-xs text-center mb-2">
                Debug: Name: {performerName ? '✓' : '✗'} | Session: {sessionId ? '✓' : '✗'}
            </div>
            <Button
                className="flex items-center gap-2 w-1/2 mx-auto"
                style={{ backgroundColor: '#16a34a' }}
                onClick={handleSubmit}
                disabled={!performerName.trim() || !sessionId}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
                {editMode ? 'Update' : 'Submit'}
            </Button>

            {/* Song Selection Modal */}
            <SongSelectionModal
                sessionId={parseInt(sessionId)}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSongSelect={handleSongSelected}
                unavailableSongIds={getUnavailableSongIds()}
            />
        </div>
    )
}