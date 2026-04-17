import { useState, useEffect } from "react";
import { TabsContent } from "../../../shared/Tabs";
import AddNewASongPanel from "./AddNewSongPanel";
import ImportSongsPanel from "./ImportSongsPanel";
import AllowedSongsList from "./AllowedSongsList";
import ChooseFromOldSessionPanel from "./ChooseFromOldSessionPanel";
import { AdminUser } from "../../../../types/apiTypes/adminUser";
import { Session } from "../../../../types/apiTypes/session";

interface SongDatabasePanelProps {
    adminInfo: AdminUser;
    sessionLaunchTrigger?: number;
    activeSession?: Session | null;
}

export default function SongDatabasePanel({ adminInfo, sessionLaunchTrigger, activeSession }: SongDatabasePanelProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Refresh when activeSession changes (session launched or ended)
    useEffect(() => {
        console.log('SongDatabasePanel: activeSession changed to:', activeSession);
        console.log('  - session_id:', activeSession?.session_id);
        console.log('  - Incrementing refreshTrigger to force re-fetch');
        setRefreshTrigger(prev => {
            const newValue = prev + 1;
            console.log('  - refreshTrigger:', prev, '->', newValue);
            return newValue;
        });
    }, [activeSession?.session_id]);

    const handleSongsUpdated = () => {
        console.log('SongDatabasePanel: handleSongsUpdated called, incrementing refreshTrigger');
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <TabsContent value="database" className="space-y-6">
            <AllowedSongsList
                adminInfo={adminInfo}
                refreshTrigger={refreshTrigger}
                onSongRemoved={handleSongsUpdated}
                activeSession={activeSession}
            />
            {!activeSession && (
                <ChooseFromOldSessionPanel adminInfo={adminInfo} onSongsCopied={handleSongsUpdated} />
            )}
            {!activeSession && (
                <ImportSongsPanel adminInfo={adminInfo} onSongsUploaded={handleSongsUpdated} />
            )}
            <AddNewASongPanel
                adminInfo={adminInfo}
                onSongAdded={handleSongsUpdated}
                refreshTrigger={refreshTrigger}
                activeSession={activeSession}
            />
        </TabsContent>
    );
}
