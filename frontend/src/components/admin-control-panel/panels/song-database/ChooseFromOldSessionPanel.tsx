import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { History, Check, Music } from "lucide-react";
import { AdminUser } from "../../../../types/apiTypes/adminUser";
import { Button } from "../../../shared/Button";
import { SessionClient, AdminAllowedSongClient } from "../../../../api/frontendClient";

interface Session {
    session_id: number;
    session_title: string;
    created_date: string;
    status: string;
    song_count?: number;
    performer_count?: number;
    total_session_songs?: number;
}

interface ChooseFromOldSessionPanelProps {
    adminInfo: AdminUser;
    onSongsCopied?: () => void;
}

export default function ChooseFromOldSessionPanel({ adminInfo, onSongsCopied }: ChooseFromOldSessionPanelProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copyingSessionId, setCopyingSessionId] = useState<number | null>(null);
    const [copyResult, setCopyResult] = useState<{ sessionId: number; added: number; total: number } | null>(null);

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

    const handleCopyFromSession = async (session: Session) => {
        setCopyingSessionId(session.session_id);
        setCopyResult(null);

        try {
            const result = await AdminAllowedSongClient.copyFromSession(
                session.session_id,
                adminInfo.admin_user_id
            );

            setCopyResult({
                sessionId: session.session_id,
                added: result.added,
                total: result.total
            });

            // Trigger refresh of allowed songs list
            onSongsCopied?.();

            // Clear result after 3 seconds
            setTimeout(() => {
                setCopyResult(null);
            }, 3000);
        } catch (error) {
            console.error("Error copying songs from session:", error);
        } finally {
            setCopyingSessionId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Choose From Old Session
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
                    <div className="max-h-64 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-700">
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
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Music className="w-3 h-3" />
                                                {session.total_session_songs ?? 0} songs
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {copyResult?.sessionId === session.session_id && (
                                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                                <Check className="w-4 h-4" />
                                                {copyResult.added} added
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => handleCopyFromSession(session)}
                                            disabled={copyingSessionId === session.session_id}
                                            style={{ backgroundColor: '#16a34a' }}
                                            className="whitespace-nowrap"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                        >
                                            {copyingSessionId === session.session_id ? 'Adding...' : 'Add List To Session'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {copyResult && (
                    <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg flex items-center gap-2 text-green-200 text-sm">
                        <Check className="w-4 h-4" />
                        Added {copyResult.added} new songs from the session
                        {copyResult.added < copyResult.total && ` (${copyResult.total - copyResult.added} already in list)`}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
