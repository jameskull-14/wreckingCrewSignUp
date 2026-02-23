import { PowerOff } from "lucide-react";
import { Button } from "../../shared/Button";
import { Session } from "../../../types/apiTypes/session.js";

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
        const response = await fetch(`/api/sessions/${activeSession.session_id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            status: 'Completed'
          })
        });

        // Get response text first to debug
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
          console.error('Failed to end session. Status:', response.status, 'Body:', responseText);
          return;
        }

        // Try to parse as JSON if there's content
        let data = null;
        if (responseText) {
          try {
            data = JSON.parse(responseText);
            console.log('Session ended successfully:', data);
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            console.error('Response was:', responseText);
          }
        }

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