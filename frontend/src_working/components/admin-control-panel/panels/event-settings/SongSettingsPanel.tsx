import { AdminControlPanelProps } from "../../../../types/componentTypes/adminControlPanelProps";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { Input } from "../../../shared/Input";
import { Label } from "../../../shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/Select";
import { useState, useEffect } from "react";
import { Song, AdminAllowedSong } from "../../../../api/frontendClient";

interface SongResult {
    id: number;
    title: string;
    artist: string;
    genre?: string;
}

export default function SongSettingsPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo
}: AdminControlPanelProps)
{
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SongResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allowedSongs, setAllowedSongs] = useState<Set<number>>(new Set());

    // Load allowed songs on mount
    useEffect(() => {
        const loadAllowedSongs = async () => {
            if (!adminInfo?.admin_user_id) return;

            try {
                const results = await AdminAllowedSong.list(adminInfo.admin_user_id);
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
    }, [adminInfo?.admin_user_id]);

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
                    Song.search({ song_title: searchTerm }),
                    Song.search({ artist: searchTerm })
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

    const handleToggleSong = async (songId: number) => {
        if (!adminInfo?.admin_user_id) {
            console.error('No admin_user_id found');
            return;
        }

        const isAdded = allowedSongs.has(songId);

        try {
            if (isAdded) {
                // Remove song
                console.log('Removing song:', { admin_user_id: adminInfo.admin_user_id, song_id: songId });
                await AdminAllowedSong.delete(adminInfo.admin_user_id, songId);
                console.log('Song removed successfully');

                // Update local state
                const newAllowedSongs = new Set(allowedSongs);
                newAllowedSongs.delete(songId);
                setAllowedSongs(newAllowedSongs);
            } else {
                // Add song
                console.log('Adding song:', { admin_user_id: adminInfo.admin_user_id, song_id: songId });
                const result = await AdminAllowedSong.create({
                    admin_user_id: adminInfo.admin_user_id,
                    song_id: songId
                });
                console.log('Song added successfully:', result);

                // Update local state
                const newAllowedSongs = new Set(allowedSongs);
                newAllowedSongs.add(songId);
                setAllowedSongs(newAllowedSongs);
            }
        } catch (error) {
            console.error('Error toggling song:', error);
            if (error && typeof error === 'object' && 'detail' in error) {
                console.error('Error detail:', error.detail);
            }
        }
    }

    return(
        <div>
            <Card className="bg-gray-800/50 border-amber-400/20">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    Song Selection
                    </CardTitle>
                    <div className="text-gray-400 text-sm">Select what songs or themes you want to be available to the performers</div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-white">Theme</Label>
                        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                            <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="60s">60's</SelectItem>
                                <SelectItem value="70s">70's</SelectItem>
                                <SelectItem value="80s">80's</SelectItem>
                                <SelectItem value="90s">90's</SelectItem>
                                <SelectItem value="00s">00's</SelectItem>
                                <SelectItem value="10s">10's</SelectItem>
                                <SelectItem value="20s">20's</SelectItem>
                                <SelectItem value="punk">Punk</SelectItem>
                                <SelectItem value="musical">Musical</SelectItem>
                                <SelectItem value="rock">Rock</SelectItem>
                                <SelectItem value="pop">Pop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-white">Search Song</Label>
                        <Input
                            type="text"
                            placeholder="Search by title or artist"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="bg-gray-900/50 border-amber-400/30 text-white text-sm"
                        />
                    </div>

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
                                            const isAdded = allowedSongs.has(song.id);
                                            console.log(`Song ${song.id} (${song.title}): isAdded=${isAdded}, in Set=${allowedSongs.has(song.id)}`);
                                            return (
                                                <div
                                                    key={song.id}
                                                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-400/50 cursor-pointer transition-colors"
                                                    onClick={() => handleToggleSong(song.id)}
                                                >
                                                    <div>
                                                        <div className="text-white font-medium">{song.title}</div>
                                                        <div className="text-gray-400 text-sm">{song.artist}</div>
                                                    </div>
                                                    <div
                                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                                                            isAdded
                                                                ? 'border-green-500 bg-green-500'
                                                                : 'border-amber-400 bg-transparent hover:bg-amber-400/20'
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleSong(song.id);
                                                        }}
                                                    >
                                                        {isAdded && (
                                                            <span className="text-white font-bold text-lg">✓</span>
                                                        )}
                                                    </div>
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
                </CardContent>
            </Card>
        </div>
    )
}