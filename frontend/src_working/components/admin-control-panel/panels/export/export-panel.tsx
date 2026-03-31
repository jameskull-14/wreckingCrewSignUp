import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { Download, FileText, Users, Music } from "lucide-react";
import { AdminUser } from "../../../../types/apiTypes/adminUser";
import { Button } from "../../../shared/Button";
import { SessionClient, PerformerClient, PerformerSongSelectionClient } from "../../../../api/frontendClient";
import { PerformerType } from "../../../../types/apiTypes/performer";

interface Session {
    session_id: number;
    session_title: string;
    created_date: string;
    status: string;
    songs_per_performer: number;
    song_count?: number;
    performer_count?: number;
}

interface ExportPanelProps {
    adminInfo: AdminUser;
}

export default function ExportPanel({ adminInfo }: ExportPanelProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exportingSessionId, setExportingSessionId] = useState<number | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const sessionsList = await SessionClient.list(adminInfo.admin_user_id);
                // Sort by created_date descending (newest first)
                const sortedSessions = (sessionsList || []).sort((a: Session, b: Session) => {
                    return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
                });
                setSessions(sortedSessions);
            } catch (error) {
                console.error("Error fetching sessions:", error);
                setSessions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, [adminInfo.admin_user_id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateForFilename = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    };

    const generateCSV = async (session: Session) => {
        setExportingSessionId(session.session_id);

        try {
            // Fetch performers and their song selections
            const performers = await PerformerClient.list(session.session_id.toString());
            const songSelections = await PerformerSongSelectionClient.get(session.session_id.toString());

            // Group song selections by performer
            const performerSongsMap: Record<number, any[]> = {};
            songSelections.forEach((selection: any) => {
                if (!performerSongsMap[selection.performer_id]) {
                    performerSongsMap[selection.performer_id] = [];
                }
                performerSongsMap[selection.performer_id].push(selection);
            });

            // Sort songs by selection_order for each performer
            Object.keys(performerSongsMap).forEach((performerId) => {
                performerSongsMap[Number(performerId)].sort((a, b) =>
                    parseInt(a.selection_order) - parseInt(b.selection_order)
                );
            });

            // Build CSV header
            const headers = ['Performer Name', 'Type'];
            for (let i = 1; i <= session.songs_per_performer; i++) {
                if (i === 1) {
                    headers.push('Song', 'Artist', 'Singing', 'Instrument');
                } else {
                    headers.push(`Song ${i}`, `Artist ${i}`, `Singing ${i}`, `Instrument ${i}`);
                }
            }

            // Build CSV rows
            const rows: string[][] = [headers];
            performers.forEach((performer: any) => {
                const row: string[] = [
                    `"${performer.performer_name.replace(/"/g, '""')}"`,
                    performer.performer_type === PerformerType.group ? 'Group' : 'Individual'
                ];

                const songs = performerSongsMap[performer.performer_id] || [];
                for (let i = 0; i < session.songs_per_performer; i++) {
                    const song = songs[i];
                    if (song) {
                        row.push(
                            `"${song.song_title.replace(/"/g, '""')}"`,
                            `"${song.artist.replace(/"/g, '""')}"`,
                            song.is_singing ? 'Yes' : 'No',
                            song.instrument ? `"${song.instrument.replace(/"/g, '""')}"` : ''
                        );
                    } else {
                        // Empty song slot
                        row.push('', '', '', '');
                    }
                }
                rows.push(row);
            });

            // Convert to CSV string
            const csvContent = rows.map(row => row.join(',')).join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const filename = `${session.session_title.replace(/[^a-z0-9]/gi, '_')}_${formatDateForFilename(session.created_date)}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error generating CSV:", error);
            alert("Failed to export session data");
        } finally {
            setExportingSessionId(null);
        }
    };

    return (
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Export Previous Sessions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-gray-400 py-8">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No previous sessions found
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-700">
                        {sessions.map((session) => (
                            <div
                                key={session.session_id}
                                className="p-3 hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-white font-medium">{session.session_title}</div>
                                        <div className="text-gray-400 text-sm flex items-center gap-3">
                                            <span>{formatDate(session.created_date)} • {session.status}</span>
                                            <span className="flex items-center gap-1 text-cyan-400">
                                                <Users className="w-3 h-3" />
                                                {session.performer_count ?? 0} performers
                                            </span>
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Music className="w-3 h-3" />
                                                {session.song_count ?? 0} songs
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => generateCSV(session)}
                                        disabled={exportingSessionId === session.session_id}
                                        className="flex items-center gap-2"
                                        style={{ backgroundColor: '#3b82f6' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                    >
                                        <Download className="w-4 h-4" />
                                        {exportingSessionId === session.session_id ? 'Exporting...' : 'Export CSV'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}