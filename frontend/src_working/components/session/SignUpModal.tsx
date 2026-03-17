import { useState } from "react";
import { Input } from "../shared/Input";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Performer, PerformerCreate, PerformerStatus } from "../../types/apiTypes/performer";
import { PerformerSongSelectionCreate } from "../../types/apiTypes/performerSongSelection";
import { Button } from "../shared/Button";
import SongSearch from "../SongSearch";
import { PerformerClient, PerformerSongSelectionClient } from "../../api/frontendClient";

interface SignUpPanelInterface{
    adminSettings: AdminUserSetting | null,
    sessionId: string,
    performers: Performer[],
    onPerformerCreated?: () => void
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
    onPerformerCreated
}: SignUpPanelInterface){
    const [performerName, setPerformerName] = useState("");

    const songsPerPerformer = adminSettings?.songs_per_performer || 1;
    const allowInstrumentUse = adminSettings?.allow_instrument_use || false;
    const instruments = ["Guitar", "Drums", "Bass", "Piano", "Other"];

    // Initialize song slots based on songs_per_performer
    const [songSlots, setSongSlots] = useState<SongSlot[]>(
        Array.from({ length: songsPerPerformer }, () => ({
            song: null,
            isSinging: true,
            instrument: ""
        }))
    );

    const nextQueueNumber =
        performers.length > 0 ?
        Math.max(...performers.map(p =>p.queue_number)) + 1
        : 1;

    const updateSongSlot = (index: number, updates: Partial<SongSlot>) => {
        setSongSlots(prev => {
            const newSlots = [...prev];
            newSlots[index] = { ...newSlots[index], ...updates };
            return newSlots;
        });
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
                status: PerformerStatus.waiting
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

                    await PerformerSongSelectionClient.create(songSelection);
                    console.log(`Song selection ${selectionOrder} created for song:`, slot.song.song_title);
                    selectionOrder++;
                }
            }

            // Reset form after successful submission
            setPerformerName("");
            setSongSlots(Array.from({ length: songsPerPerformer }, () => ({
                song: null,
                isSinging: true,
                instrument: ""
            })));

            // Refresh performers list in parent (now that songs are created too)
            onPerformerCreated?.();

            alert('Successfully signed up!');
        } catch (error) {
            console.error('❌ Error creating performer or song selections:', error);
            console.error('Error details:', error instanceof Error ? error.message : String(error));
            alert(`Failed to sign up: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <div className="text-white mb-1 text-sm">Performer Name:</div>
                <Input
                    type="text"
                    placeholder="Name"
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
                            <SongSearch
                                mode="select"
                                onSongSelect={(song) => updateSongSlot(index, { song })}
                                showLabel={false}
                                placeholder={`Song ${index + 1}`}
                                inputClassName="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
                            />
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
                                {instruments.map((instrument) => (
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
                onClick={() => {
                    if (!sessionId || !performerName.trim()) return;
                    handleNewPeformer(performerName, sessionId);
                }}
                disabled={!performerName.trim() || !sessionId}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
                Submit
            </Button>
        </div>
    )
}