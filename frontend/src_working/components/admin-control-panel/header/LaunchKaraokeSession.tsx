import React from "react";
import { Button } from "../../shared/Button.js";
import { PowerOff, Rocket } from "lucide-react";

interface LaunchKaraokeSessionProps {
    onUpdateSession: (session: boolean) => void;
    adminId: number;
    onOpenPublicWindow?: (window: Window) => void;
}

export default function LaunchKaraokeSession({onUpdateSession, adminId, onOpenPublicWindow}: LaunchKaraokeSessionProps)
{

    const handleLaunchSession = async () => {
      localStorage.setItem(`karaoke_session_${adminId}`, 'active')
      onUpdateSession(true)
      const publicWindow = window.open(`/public/${adminId}`, '_blank')
      if (publicWindow && onOpenPublicWindow) {
        onOpenPublicWindow(publicWindow)
      }
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