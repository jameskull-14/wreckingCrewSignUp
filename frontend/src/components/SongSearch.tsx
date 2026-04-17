import { useState, useEffect } from "react";
import { Input } from "./shared/Input";
import { Label } from "./shared/Label";
import { Button } from "./shared/Button";
import { SongClient, AdminAllowedSongClient, SessionSongClient } from "../api/frontendClient";
import { Session } from "../types/apiTypes/session";

interface SongResult {
    song_id: number;
    song_title: string;
    artist: string;
    genre?: string;
}

interface SongSearchProps {
    adminUserId?: number;
    mode?: "toggle" | "select"; // toggle = add/remove songs, select = just pick a song
    onSongSelect?: (song: SongResult) => void; // Callback when song is selected (select mode)
    onSongAdded?: () => void; // Callback when song is added to allowed list (toggle mode)
    refreshTrigger?: number; // External trigger to reload allowed songs
    activeSession?: Session | null; // If session is active, write to session_song instead
    showLabel?: boolean;
    placeholder?: string;
    inputClassName?: string;
}

export default function SongSearch({
    adminUserId,
    mode = "toggle",
    onSongSelect,
    onSongAdded,
    refreshTrigger,
    activeSession,
    showLabel = true,
    placeholder = "Search by title or artist",
    inputClassName = "bg-gray-900/50 border-amber-400/30 text-white text-sm"
}: SongSearchProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SongResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allowedSongs, setAllowedSongs] = useState<Set<number>>(new Set());
    const [addingSongId, setAddingSongId] = useState<number | null>(null);

    // Load allowed songs on mount and when refreshTrigger changes (only in toggle mode)
    useEffect(() => {
        if (mode !== "toggle") return;

        const loadAllowedSongs = async () => {
            console.log('\n=== SongSearch: loadAllowedSongs ===');
            console.log('  - mode:', mode);
            console.log('  - activeSession:', activeSession);
            console.log('  - activeSession?.session_id:', activeSession?.session_id);
            console.log('  - adminUserId:', adminUserId);
            console.log('  - refreshTrigger:', refreshTrigger);

            if (activeSession?.session_id) {
                // Load from session_song table
                try {
                    console.log('  → Loading from SESSION_SONG table for session:', activeSession.session_id);
                    const results = await SessionSongClient.list(activeSession.session_id);
                    console.log('  ← Loaded', results?.length || 0, 'songs from session_song');
                    const songIds = new Set(
                        Array.isArray(results)
                            ? results.map((item: any) => item.song_id)
                            : []
                    );
                    console.log('  Song IDs:', Array.from(songIds));
                    setAllowedSongs(songIds);
                } catch (error) {
                    console.error('  ✗ Error loading session songs:', error);
                }
            } else if (adminUserId) {
                // Load from admin_allowed_song table
                try {
                    console.log('  → Loading from ADMIN_ALLOWED_SONG table for admin:', adminUserId);
                    const results = await AdminAllowedSongClient.list(adminUserId);
                    console.log('  ← Loaded', results?.length || 0, 'songs from admin_allowed_song');
                    const songIds = new Set(
                        Array.isArray(results)
                            ? results.map((item: any) => item.song_id)
                            : []
                    );
                    console.log('  Song IDs:', Array.from(songIds));
                    setAllowedSongs(songIds);
                } catch (error) {
                    console.error('  ✗ Error loading allowed songs:', error);
                }
            }
            console.log('=== SongSearch: loadAllowedSongs complete ===\n');
        };

        loadAllowedSongs();
    }, [adminUserId, mode, refreshTrigger, activeSession?.session_id]);

    // Debounced search effect
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const delaySearch = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Search by title and artist separately, then combine results
                // Backend already does case-insensitive partial matching with ilike
                const [titleResults, artistResults] = await Promise.all([
                    SongClient.search({ song_title: searchTerm }),
                    SongClient.search({ artist: searchTerm })
                ]);

                console.log('Title results:', titleResults);
                console.log('Artist results:', artistResults);

                // Combine and deduplicate results by song_id
                const combinedMap = new Map();
                const allResults = [
                    ...(Array.isArray(titleResults) ? titleResults : []),
                    ...(Array.isArray(artistResults) ? artistResults : [])
                ];

                allResults.forEach(song => {
                    if (song && song.song_id) {
                        combinedMap.set(song.song_id, song);
                    }
                });

                const results = Array.from(combinedMap.values());
                console.log('Final combined results:', results);
                setSearchResults(results);
            } catch (error) {
                console.error('Error searching songs:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleSongClick = async (song: SongResult) => {
        if (mode === "select") {
            // In select mode, just call the callback
            onSongSelect?.(song);
            return;
        }

        // Toggle mode - only allow adding songs (not removing)
        const isAdded = allowedSongs.has(song.song_id);
        if (isAdded) {
            // Song already added, don't do anything
            return;
        }

        setAddingSongId(song.song_id);
        try {
            console.log('\n=== SongSearch: Adding song ===');
            console.log('  Song:', song);
            console.log('  activeSession:', activeSession);
            console.log('  adminUserId:', adminUserId);

            if (activeSession) {
                // Add to session_song table
                console.log('  → Adding to SESSION_SONG table');
                console.log('  Data:', { session_id: activeSession.session_id, song_id: song.song_id });
                const result = await SessionSongClient.create({
                    session_id: activeSession.session_id,
                    song_id: song.song_id
                });
                console.log('  ✓ Song added to session successfully:', result);
            } else if (adminUserId) {
                // Add to admin_allowed_song table
                console.log('  → Adding to ADMIN_ALLOWED_SONG table');
                console.log('  Data:', { admin_user_id: adminUserId, song_id: song.song_id });
                const result = await AdminAllowedSongClient.create({
                    admin_user_id: adminUserId,
                    song_id: song.song_id
                });
                console.log('  ✓ Song added successfully:', result);
            } else {
                console.error('  ✗ No admin_user_id or active session found');
                return;
            }

            // Update local state
            const newAllowedSongs = new Set(allowedSongs);
            newAllowedSongs.add(song.song_id);
            setAllowedSongs(newAllowedSongs);
            console.log('  Updated local allowedSongs set');

            // Call callback to refresh parent
            console.log('  Calling onSongAdded callback');
            onSongAdded?.();
            console.log('=== SongSearch: Adding song complete ===\n');
        } catch (error) {
            console.error('  ✗ Error adding song:', error);
            if (error && typeof error === 'object' && 'detail' in error) {
                console.error('  Error detail:', error.detail);
            }
        } finally {
            setAddingSongId(null);
        }
    }

    return (
        <div>
            {showLabel && <Label className="text-white">Search Song</Label>}
            <Input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => e.target.select()}
                className={inputClassName}
            />

            {/* Search Results */}
            {searchTerm && (
                <div className="mt-4">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-4">
                            Searching...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                            <Label className="text-white text-sm">Search Results ({searchResults.length})</Label>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {searchResults.map((song) => {
                                    const isAdded = mode === "toggle" ? allowedSongs.has(song.song_id) : false;
                                    return (
                                        <div
                                            key={song.song_id}
                                            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-400/50 transition-colors gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="text-white font-medium">{song.song_title}</div>
                                                <div className="text-gray-400 text-sm">{song.artist}</div>
                                            </div>
                                            {mode === "toggle" && !isAdded && (
                                                <Button
                                                    onClick={() => handleSongClick(song)}
                                                    disabled={addingSongId === song.song_id}
                                                    style={{ backgroundColor: '#16a34a' }}
                                                    className="text-white text-sm whitespace-nowrap"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                                >
                                                    {addingSongId === song.song_id ? 'Adding...' : 'Add Song'}
                                                </Button>
                                            )}
                                            {mode === "toggle" && isAdded && (
                                                <div className="text-green-400 text-sm font-medium">Added ✓</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-4">
                            No songs found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
