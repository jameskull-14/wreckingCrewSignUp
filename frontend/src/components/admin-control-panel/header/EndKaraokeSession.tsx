import { PowerOff } from "lucide-react";
import { Button } from "../../shared/Button";
import { Session, SessionStatus } from "../../../types/apiTypes/session.js";
import { SessionClient } from "../../../api/apis/SessionAPI.js";

interface EndKaraokeSessionProps {
    onUpdateSession: (session: Session | null) => void;
    adminId: number;
    activeSession: Session | null;
}

export default function EndKaraokeSession({onUpdateSession, adminId, activeSession}: EndKaraokeSessionProps){

    const handleEndSession = async () => {

      if (!activeSession) {
        console.error('No active session to end');
        return;
      }

      try {
        // Update session status to "Completed" in database
        const data = await SessionClient.update(activeSession.session_id, {
          status: SessionStatus.Completed
        });

        console.log('Session ended successfully:', data);

        // Update local state
        onUpdateSession(null);

        // Clean up localStorage
        localStorage.removeItem(`karaoke_session_${adminId}`);
        console.log('=== END SESSION COMPLETE ===');
      } catch (error) {
        console.error('Error ending session:', error);
      }
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