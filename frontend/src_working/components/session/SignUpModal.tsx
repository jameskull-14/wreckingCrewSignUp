import { useState } from "react";
import { Input } from "../shared/Input";
import { AdminUserSetting } from "../../types/apiTypes/adminUserSetting";
import { Performer, PerformerCreate, PerformerStatus } from "../../types/apiTypes/performer";
import { Button } from "../shared/Button";
import { Session } from "../../types/apiTypes/session";
import SongSearch from "../SongSearch";

interface SignUpPanelInterface{
    adminSettings: AdminUserSetting | null,
    session: Session | null,
    performers: Performer[]
}

export default function SignUpModal({
    adminSettings,
    session,
    performers
}: SignUpPanelInterface){
    const [performerName, setPerformerName] = useState("");
    const [selectedSong, setSelectedSong] = useState<any>(null);
    const [newPerformer, setNewPerformer] = useState<PerformerCreate | null>(null);
 
    const nextQueueNumber =
        performers.length > 0 ?
        Math.max(...performers.map(p =>p.queue_number)) + 1
        : 1;

    const handleNewPeformer = (name: string, session_Id: number) => {

        const performer: PerformerCreate = {
            performer_name: name,
            queue_number: nextQueueNumber,
            status: PerformerStatus.WAITING,
            session_id: session_Id
        }

        setNewPerformer(performer)

        fetch(`api/performers/${session_Id}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPerformer)
        })
    }

    return (
        <div className="space-y-4">
            <Input
                type="text"
                placeholder="Name"
                onChange={(e) => setPerformerName(e.target.value)}
                className="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
            />

            <SongSearch
                mode="select"
                onSongSelect={(song) => setSelectedSong(song)}
                showLabel={false}
                placeholder="Search for a song..."
                inputClassName="bg-gray-800 border-amber-400/30 text-white placeholder:text-gray-500"
            />

            {selectedSong && (
                <div className="p-3 bg-amber-400/10 rounded-md border border-amber-400/30">
                    <p className="text-white font-medium">{selectedSong.title}</p>
                    <p className="text-gray-400 text-sm">{selectedSong.artist}</p>
                </div>
            )}

            <Button
                className="flex items-center gap-2"
                style={{ backgroundColor: '#16a34a' }}
                onClick={() => {
                    if (!session?.session_id || !performerName.trim()) return;
                    handleNewPeformer(performerName, session.session_id);
                }}
                disabled={!performerName.trim() || !session?.session_id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
                Submit
            </Button>
        </div>
    )
}