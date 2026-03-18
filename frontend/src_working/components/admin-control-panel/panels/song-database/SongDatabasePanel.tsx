import { TabsContent } from "../../../shared/Tabs";
import AddNewASongPanel from "./AddNewSongPanel";

export default function SongDatabasePanel() {
    return (
        <TabsContent value="database" className="space-y-6">
            <AddNewASongPanel/>
        </TabsContent>
    );
}
