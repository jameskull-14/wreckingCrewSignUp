import React from "react";
import { Button } from "../../shared/Button.js";
import { PowerOff, Rocket } from "lucide-react";

interface LaunchKaraokeSessionProps {
    onUpdateSession: (session: boolean) => void;
    adminId: number;
}

export default function LaunchKaraokeSession({onUpdateSession, adminId}: LaunchKaraokeSessionProps)
{

    const handleLaunchSession = async () => {
      localStorage.setItem(`karaoke_session_${adminId}`, 'active')
      onUpdateSession(true)
      window.open(`/public/${adminId}`, '_blank')
    }

    return(
        <div>
          <Button
            key="launch-session"
            onClick={handleLaunchSession}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex-1 sm:flex-none"
          >
          <Rocket className="w-4 h-4 mr-2" />
            Launch Karaoke Session
          </Button>
        </div>
    )
}