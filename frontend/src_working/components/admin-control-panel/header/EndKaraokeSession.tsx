import { PowerOff } from "lucide-react";
import { Button } from "../../shared/Button";

interface EndKaraokeSessionProps {
    onUpdateSession: (session: boolean) => void;
    adminId: number;
}

export default function EndKaraokeSession({onUpdateSession, adminId}: EndKaraokeSessionProps){

    const handleEndSession = async () => {
      localStorage.removeItem(`karaoke_session_${adminId}`)
      onUpdateSession(false)
    }

    return(
        <div>
          <Button
            key="end-session"
            onClick={handleEndSession}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-1 sm:flex-none"
          >
          <PowerOff className="w-4 h-4 mr-2" />
            End Karaoke Session
          </Button>
        </div>
    )
}