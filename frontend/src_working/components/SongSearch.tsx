import { useState, useEffect } from "react";
import { Input } from "./shared/Input";
import { Label } from "./shared/Label";
import { SongClient, AdminAllowedSongClient } from "../api/frontendClient";

interface SongResult {
    id: number;
    title: string;
    artist: string;
    genre?: string;
}

interface SongSearchProps {
    adminUserId?: number;
    mode?: "toggle" | "select"; // toggle = add/remove songs, select = just pick a song
    onSongSelect?: (song: SongResult) => void; // Callback when song is selected (select mode)
    showLabel?: boolean;
    placeholder?: string;
    inputClassName?: string;
}

export default function SongSearch({
    adminUserId,
    mode = "toggle",
    onSongSelect,
    showLabel = true,
    placeholder = "Search by title or artist",
    inputClassName = "bg-gray-900/50 border-amber-400/30 text-white text-sm"
}: SongSearchProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SongResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allowedSongs, setAllowedSongs] = useState<Set<number>>(new Set());

    // Load allowed songs on mount (only in toggle mode)
    useEffect(() => {
        if (mode !== "toggle") return;

        const loadAllowedSongs = async () => {
            if (!adminUserId) return;

            try {
                const results = await AdminAllowedSongClient.list(adminUserId);
                const songIds = new Set(
                    Array.isArray(results)
                        ? results.map((item: any) => item.song_id)
                        : []
                );
                setAllowedSongs(songIds);
            } catch (error) {
                console.error('Error loading allowed songs:', error);
            }
        };

        loadAllowedSongs();
    }, [adminUserId, mode]);

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
                    if (song && song.id) {
                        combinedMap.set(song.id, song);
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

        // Toggle mode - add/remove song from allowed list
        if (!adminUserId) {
            console.error('No admin_user_id found');
            return;
        }

        const isAdded = allowedSongs.has(song.id);

        try {
            if (isAdded) {
                // Remove song
                console.log('Removing song:', { admin_user_id: adminUserId, song_id: song.id });
                await AdminAllowedSongClient.delete(adminUserId, song.id);
                console.log('Song removed successfully');

                // Update local state
                const newAllowedSongs = new Set(allowedSongs);
                newAllowedSongs.delete(song.id);
                setAllowedSongs(newAllowedSongs);
            } else {
                // Add song
                console.log('Adding song:', { admin_user_id: adminUserId, song_id: song.id });
                const result = await AdminAllowedSongClient.create({
                    admin_user_id: adminUserId,
                    song_id: song.id
                });
                console.log('Song added successfully:', result);

                // Update local state
                const newAllowedSongs = new Set(allowedSongs);
                newAllowedSongs.add(song.id);
                setAllowedSongs(newAllowedSongs);
            }
        } catch (error) {
            console.error('Error toggling song:', error);
            if (error && typeof error === 'object' && 'detail' in error) {
                console.error('Error detail:', error.detail);
            }
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
                                    const isAdded = mode === "toggle" ? allowedSongs.has(song.id) : false;
                                    return (
                                        <div
                                            key={song.id}
                                            className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-400/50 cursor-pointer transition-colors"
                                            onClick={() => handleSongClick(song)}
                                        >
                                            <div>
                                                <div className="text-white font-medium">{song.title}</div>
                                                <div className="text-gray-400 text-sm">{song.artist}</div>
                                            </div>
                                            {mode === "toggle" && (
                                                <div
                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                                                        isAdded
                                                            ? 'border-green-500 bg-green-500'
                                                            : 'border-amber-400 bg-transparent hover:bg-amber-400/20'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSongClick(song);
                                                    }}
                                                >
                                                    {isAdded && (
                                                        <span className="text-white font-bold text-lg">✓</span>
                                                    )}
                                                </div>
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
