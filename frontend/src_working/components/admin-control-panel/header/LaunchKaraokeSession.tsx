import React from "react";
import { Button } from "../../shared/Button";
import { PowerOff, Rocket } from "lucide-react";

export default function LaunchKaraokeSession({
    is_session_active
})
{

    const handleEndSession = async () => {

    }

    const handleLaunchSession = async () => {

    }

    return(
        <div>
            {is_session_active ? (
              <Button
                key="end-session"
                onClick={handleEndSession}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-1 sm:flex-none"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                End Karaoke Session
              </Button>
            ) : (
              <Button
                key="launch-session"
                onClick={handleLaunchSession}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex-1 sm:flex-none"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Launch Karaoke Session
              </Button>
            )}
        </div>
    )
}