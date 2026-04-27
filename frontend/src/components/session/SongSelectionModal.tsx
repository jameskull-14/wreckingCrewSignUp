import { useState, useEffect } from "react";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { SessionSongClient } from "../../api/frontendClient";

interface SongResult {
    session_id: number;
    song_id: number;
    song_title: string;
    artist: string;
}

interface SongSelectionModalProps {
    sessionId: number;
    isOpen: boolean;
    onClose: () => void;
    onSongSelect: (song: SongResult) => void;
    unavailableSongIds?: number[]; // Songs already selected by this performer
}

export default function SongSelectionModal({
    sessionId,
    isOpen,
    onClose,
    onSongSelect,
    unavailableSongIds = []
}: SongSelectionModalProps) {
    const [allSongs, setAllSongs] = useState<SongResult[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<SongResult[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSong, setSelectedSong] = useState<SongResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load all session songs when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const loadSongs = async () => {
            setIsLoading(true);
            try {
                const songs = await SessionSongClient.list(sessionId);

                // Sort by artist name
                const sortedSongs = Array.isArray(songs)
                    ? [...songs].sort((a, b) => a.artist.localeCompare(b.artist))
                    : [];

                setAllSongs(sortedSongs);
                setFilteredSongs(sortedSongs);
            } catch (error) {
                setAllSongs([]);
                setFilteredSongs([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadSongs();
        setSearchTerm("");
        setSelectedSong(null);
    }, [isOpen, sessionId]);

    // Filter songs based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSongs(allSongs);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allSongs.filter(song =>
            song.song_title.toLowerCase().includes(term) ||
            song.artist.toLowerCase().includes(term)
        );
        setFilteredSongs(filtered);
    }, [searchTerm, allSongs]);

    const handleSongSelect = (song: SongResult) => {
        // Toggle selection
        setSelectedSong(selectedSong?.song_id === song.song_id ? null : song);
    };

    const handleSubmit = () => {
        if (selectedSong) {
            onSongSelect(selectedSong);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="border-2 border-amber-400/50 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ height: '75vh', maxHeight: '75vh' }}>
                {/* Header */}
                <div className="p-6 border-b border-amber-400/30">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-amber-400">Select a Song</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search Input */}
                    <Input
                        type="text"
                        placeholder="Search by title or artist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
                    />
                </div>

                {/* Scrollable Song List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-8">
                            Loading songs...
                        </div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            {searchTerm ? 'No songs match your search' : 'No songs available in this session'}
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 rounded-lg border border-gray-700">
                            {filteredSongs.map((song) => {
                                const isSelected = selectedSong?.song_id === song.song_id;
                                const isUnavailable = unavailableSongIds.includes(song.song_id);

                                return (
                                    <div
                                        key={song.song_id}
                                        className={`flex items-center gap-3 p-3 transition-colors ${
                                            isUnavailable
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isSelected
                                                ? 'bg-green-500/20'
                                                : 'hover:bg-gray-800/50 cursor-pointer'
                                        }`}
                                        onClick={() => !isUnavailable && handleSongSelect(song)}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                isSelected
                                                    ? 'border-green-500 bg-green-500'
                                                    : 'border-gray-600 bg-gray-800'
                                            }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="w-4 h-4 text-white"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            )}
                                        </div>

                                        {/* Song Info */}
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{song.song_title}</div>
                                            <div className="text-gray-400 text-sm">{song.artist}</div>
                                        </div>

                                        {isUnavailable && (
                                            <div className="text-red-400 text-xs font-medium">
                                                Already Selected
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer with Submit Button */}
                <div className="p-6 border-t border-amber-400/30">
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedSong}
                        className="w-full"
                        style={{
                            backgroundColor: selectedSong ? '#16a34a' : '#6b7280',
                            cursor: selectedSong ? 'pointer' : 'not-allowed'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedSong) {
                                e.currentTarget.style.backgroundColor = '#15803d';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedSong) {
                                e.currentTarget.style.backgroundColor = '#16a34a';
                            }
                        }}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
