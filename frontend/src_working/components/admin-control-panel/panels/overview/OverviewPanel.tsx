import { Card, CardContent } from "../../../shared/Card.js";
import { Clock, Music, Users } from "lucide-react";
import { useParticipants } from "../../../../context/ParticipantsContext.js";
import { useSongs } from "../../../../context/SongsContext.js";

export default function OverviewPanel() {
  // Grab only what you need from each context
  const { participantCount, availableSlots } = useParticipants();
  const { songCount } = useSongs();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card key="signed-up" className="bg-gray-800/50 border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{participantCount}</div>
                <div className="text-gray-400 text-sm">Signed Up</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card key="available" className="bg-gray-800/50 border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{availableSlots}</div>
                <div className="text-gray-400 text-sm">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card key="total-songs" className="bg-gray-800/50 border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{songCount}</div>
                <div className="text-gray-400 text-sm">Total Songs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}