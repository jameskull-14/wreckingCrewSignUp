import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { Music, Search } from "lucide-react";
import { AdminUser } from "../../../../types/apiTypes/adminUser";
import { AdminAllowedSong } from "../../../../types/apiTypes/adminAllowedSong";
import { SessionSong } from "../../../../types/apiTypes/sessionSong";
import { Session } from "../../../../types/apiTypes/session";
import { Input } from "../../../shared/Input";
import { Button } from "../../../shared/Button";
import { AdminAllowedSongClient, SessionSongClient } from "../../../../api/frontendClient";

interface AllowedSongsListProps {
    adminInfo: AdminUser;
    refreshTrigger?: number;
    onSongRemoved?: () => void;
    activeSession?: Session | null;
}

type SongItem = (AdminAllowedSong | SessionSong) & {
    song_id: number;
    song_title?: string;
    artist?: string;
};

export default function AllowedSongsList({ adminInfo, refreshTrigger, onSongRemoved, activeSession }: AllowedSongsListProps) {
    const [allowedSongs, setAllowedSongs] = useState<SongItem[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<SongItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [removingSongId, setRemovingSongId] = useState<number | null>(null);

    const fetchAllowedSongs = async () => {
        console.log('\n=== AllowedSongsList: fetchAllowedSongs called ===');
        console.log('  - activeSession:', activeSession);
        console.log('  - activeSession?.session_id:', activeSession?.session_id);
        console.log('  - adminInfo.admin_user_id:', adminInfo.admin_user_id);

        setIsLoading(true);
        try {
            if (activeSession?.session_id) {
                // Fetch from session_song table
                console.log('  → Fetching from SESSION_SONG table for session:', activeSession.session_id);
                const songs = await SessionSongClient.list(activeSession.session_id);
                console.log('  ← Received', songs?.length || 0, 'songs from session_song');
                console.log('  Songs:', songs);
                setAllowedSongs(songs || []);
                setFilteredSongs(songs || []);
            } else {
                // Fetch from admin_allowed_song table
                console.log('  → Fetching from ADMIN_ALLOWED_SONG table for admin:', adminInfo.admin_user_id);
                const songs = await AdminAllowedSongClient.list(adminInfo.admin_user_id);
                console.log('  ← Received', songs?.length || 0, 'songs from admin_allowed_song');
                console.log('  Songs:', songs);
                setAllowedSongs(songs || []);
                setFilteredSongs(songs || []);
            }
        } catch (error) {
            console.error("  ✗ Error fetching songs:", error);
            setAllowedSongs([]);
            setFilteredSongs([]);
        } finally {
            setIsLoading(false);
            console.log('=== AllowedSongsList: fetchAllowedSongs complete ===\n');
        }
    };

    const handleRemoveSong = async (songId: number) => {
        setRemovingSongId(songId);
        try {
            if (activeSession) {
                // Remove from session_song table
                await SessionSongClient.delete(activeSession.session_id, songId);
            } else {
                // Remove from admin_allowed_song table
                await AdminAllowedSongClient.delete(adminInfo.admin_user_id, songId);
            }
            // Refresh the list
            await fetchAllowedSongs();
            // Notify parent to refresh other components
            onSongRemoved?.();
        } catch (error) {
            console.error("Error removing song:", error);
        } finally {
            setRemovingSongId(null);
        }
    };

    useEffect(() => {
        console.log('\n*** AllowedSongsList useEffect triggered ***');
        console.log('  Triggers: admin_user_id =', adminInfo.admin_user_id,
                    ', refreshTrigger =', refreshTrigger,
                    ', activeSession?.session_id =', activeSession?.session_id);
        fetchAllowedSongs();
    }, [adminInfo.admin_user_id, refreshTrigger, activeSession?.session_id]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSongs(allowedSongs);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allowedSongs.filter(song =>
            song.song_title?.toLowerCase().includes(term) ||
            song.artist?.toLowerCase().includes(term)
        );
        setFilteredSongs(filtered);
    }, [searchTerm, allowedSongs]);

    return (
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        {activeSession ? 'Session Songs' : 'Allowed Songs for Session'}
                    </div>
                    <span className="text-sm font-normal text-gray-300">
                        {filteredSongs.length} {filteredSongs.length === allowedSongs.length ? 'total' : `of ${allowedSongs.length}`}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by title or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-amber-400/30 text-white"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center text-gray-400 py-8">Loading songs...</div>
                ) : filteredSongs.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        {searchTerm
                            ? "No songs match your search"
                            : activeSession
                            ? "No songs in this session yet. Add songs below."
                            : "No allowed songs yet. Upload a CSV to get started."}
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-700">
                        {filteredSongs.map((song) => (
                            <div
                                key={song.song_id}
                                className="p-3 hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-4"
                            >
                                <div className="flex-1">
                                    <div className="text-white font-medium">{song.song_title}</div>
                                    <div className="text-gray-400 text-sm">{song.artist}</div>
                                </div>
                                <Button
                                    onClick={() => handleRemoveSong(song.song_id)}
                                    disabled={removingSongId === song.song_id}
                                    style={{ backgroundColor: '#dc2626' }}
                                    className="text-white text-sm whitespace-nowrap"
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                >
                                    {removingSongId === song.song_id ? 'Removing...' : 'Remove'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
