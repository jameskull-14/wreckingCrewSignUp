import { useEffect, useState } from "react";
import { Input } from "../shared/Input";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Song } from "../../api/apis/SongAPI";
import { SessionSong } from "../../api/apis/SessionSongAPI";

export default function SignUpPanel({
    adminSettings
}: { adminSettings: AdminUserSetting | null }){
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

    // Fetch active session ID
    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const response = await fetch(`api/sessions?admin_user_id=${adminSettings?.admin_user_id}&active=true`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setActiveSessionId(data[0].session_id);
                }
            } catch (error) {
                console.error('Failed to fetch active session:', error);
            }
        };

        if (adminSettings?.admin_user_id) {
            fetchActiveSession();
        }
    }, [adminSettings?.admin_user_id]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const searchSongs = async () => {
            setLoading(true);
            try {
                if (adminSettings?.use_all_songs) {
                    // Search by title and artist separately, then combine
                    const [titleResults, artistResults] = await Promise.all([
                        Song.search({ song_title: searchQuery }),
                        Song.search({ artist: searchQuery })
                    ]);

                    // Combine and deduplicate results
                    const combinedMap = new Map();
                    [...titleResults, ...artistResults].forEach((song: any) => {
                        combinedMap.set(song.song_id, song);
                    });
                    setSearchResults(Array.from(combinedMap.values()));
                } else {
                    // Fetch session songs, then get song details for each
                    if (activeSessionId) {
                        const sessionSongs = await SessionSong.list(activeSessionId);

                        // Fetch song details for each song_id
                        const songDetails = await Promise.all(
                            sessionSongs.map((ss: any) => Song.get(ss.song_id))
                        );

                        // Filter by search query
                        const filtered = songDetails.filter((song: any) => {
                            const title = (song.song_title || '').toLowerCase();
                            const artist = (song.artist || '').toLowerCase();
                            const query = searchQuery.toLowerCase();
                            return title.includes(query) || artist.includes(query);
                        });
                        setSearchResults(filtered);
                    }
                }
            } catch (error) {
                console.error('Failed to search songs:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (activeSessionId || adminSettings?.use_all_songs) {
                searchSongs();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, adminSettings?.use_all_songs, adminSettings?.admin_user_id, activeSessionId]);

    return (
        <div className="space-y-4">
            <Input
                type="text"
                placeholder="Search for a song..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
            />

            {loading && (
                <p className="text-gray-400 text-sm">Searching...</p>
            )}

            <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                    searchResults.map((song, index) => (
                        <div
                            key={index}
                            className="p-3 bg-gray-800/50 rounded-md border border-amber-400/20 hover:border-amber-400/50 cursor-pointer transition-colors"
                        >
                            <p className="text-white font-medium">{song.song_title}</p>
                            <p className="text-gray-400 text-sm">{song.artist}</p>
                        </div>
                    ))
                ) : (
                    searchQuery && !loading && (
                        <p className="text-gray-400 text-sm">No songs found</p>
                    )
                )}
            </div>
        </div>
    )
}