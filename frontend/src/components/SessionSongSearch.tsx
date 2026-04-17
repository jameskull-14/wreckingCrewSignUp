import { useState, useEffect } from "react";
import { Input } from "./shared/Input";
import { SessionSongClient, SessionClient } from "../api/frontendClient";

interface SongResult {
    session_id: number;
    song_id: number;
    song_title: string;
    artist: string;
}

interface SessionInfo {
    session_id: number;
    session_title: string;
    admin_user_id: number;
    songs_per_performer: number | null;
    allow_song_reuse: boolean;
    selected_song_ids: number[];
}

interface SessionSongSearchProps {
    sessionId: number;
    onSongSelect?: (song: SongResult) => void;
    showLabel?: boolean;
    placeholder?: string;
    inputClassName?: string;
}

export default function SessionSongSearch({
    sessionId,
    onSongSelect,
    showLabel = true,
    placeholder = "Search by title or artist",
    inputClassName = "bg-gray-900/50 border-amber-400/30 text-white text-sm"
}: SessionSongSearchProps) {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SongResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    // Load session info on mount
    useEffect(() => {
        console.log('\n=== SessionSongSearch: Loading session info ===');
        console.log('Session ID:', sessionId);

        const loadSessionInfo = async () => {
            try {
                console.log('→ Fetching session info...');
                const info = await SessionClient.getInfo(sessionId);
                console.log('✓ Session info loaded:', info);
                setSessionInfo(info);
            } catch (error) {
                console.error('✗ Error loading session info:', error);
            }
        };

        loadSessionInfo();
    }, [sessionId]);

    // Debounced search effect
    useEffect(() => {
        console.log('\n=== SessionSongSearch: Search term changed ===');
        console.log('Search term:', searchTerm);

        if (!searchTerm.trim()) {
            console.log('→ Search term empty, clearing results');
            setSearchResults([]);
            return;
        }

        const delaySearch = setTimeout(async () => {
            console.log('→ Starting search after debounce delay...');
            console.log('  Session ID:', sessionId);
            console.log('  Search term:', searchTerm);
            setIsLoading(true);
            try {
                console.log('→ Calling SessionSongClient.search...');
                const results = await SessionSongClient.search(sessionId, searchTerm);
                console.log('✓ Search results received:', results);
                console.log('  Results count:', results?.length || 0);
                setSearchResults(Array.isArray(results) ? results : []);
            } catch (error) {
                console.error('✗ Error searching songs:', error);
                if (error && typeof error === 'object') {
                    console.error('  Error details:', error);
                }
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(delaySearch);
    }, [searchTerm, sessionId]);

    const handleSongClick = (song: SongResult) => {
        // Check if song is unavailable due to allow_song_reuse setting
        if (sessionInfo && !sessionInfo.allow_song_reuse && sessionInfo.selected_song_ids.includes(song.song_id)) {
            return; // Don't allow selection of unavailable songs
        }

        onSongSelect?.(song);
        setSearchTerm(""); // Clear search after selection
        setSearchResults([]);
    };

    const isSongUnavailable = (songId: number) => {
        return sessionInfo && !sessionInfo.allow_song_reuse && sessionInfo.selected_song_ids.includes(songId);
    };

    return (
        <div>
            {showLabel && <label className="text-white">Search Song</label>}
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
                <div className="mt-2 relative z-10">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-4 bg-gray-900/95 rounded-lg border border-gray-700">
                            Searching...
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto bg-gray-900/95 rounded-lg border border-gray-700">
                            {searchResults.map((song) => {
                                const unavailable = isSongUnavailable(song.song_id);
                                return (
                                    <div
                                        key={song.song_id}
                                        className={`p-3 transition-colors ${
                                            unavailable
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-gray-800/50 cursor-pointer'
                                        }`}
                                        onClick={() => !unavailable && handleSongClick(song)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="text-white font-medium text-sm">{song.song_title}</div>
                                                <div className="text-gray-400 text-xs">{song.artist}</div>
                                            </div>
                                            {unavailable && (
                                                <div className="text-red-400 text-xs font-medium ml-2">
                                                    Already Selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-4 bg-gray-900/95 rounded-lg border border-gray-700">
                            No songs found in this session
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
