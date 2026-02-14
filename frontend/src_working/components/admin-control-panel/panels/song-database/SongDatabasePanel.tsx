import React from "react";
import { TabsContent } from "../../../shared/Tabs";
import SongImportPanel from "./ImportSongsPanel";
import AddNewASongPanel from "./AddNewSongPanel";

export default function SongDatabasePanel() {
    return (
        <TabsContent value="database" className="space-y-6">
            <SongImportPanel/>
            <AddNewASongPanel/>
        </TabsContent>
    );
}
