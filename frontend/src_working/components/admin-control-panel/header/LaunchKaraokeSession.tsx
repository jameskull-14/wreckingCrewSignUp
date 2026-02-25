import React from "react";
import { Button } from "../../shared/Button.js";
import { PowerOff, Rocket } from "lucide-react";
import { AdminUserSetting } from "../../../types/apiTypes/adminUserSetting.js";
import { Session, SessionCreate, SessionStatus, SessionMode } from "../../../types/apiTypes/session.js";
import { SessionClient } from "../../../api/frontendClient.js";

interface LaunchKaraokeSessionProps {
    onUpdateSession: (session: Session | null) => void;
    adminId: number;
    onOpenPublicWindow?: (window: Window) => void;
    adminSettings: AdminUserSetting | null;
}

export default function LaunchKaraokeSession({onUpdateSession, adminId, onOpenPublicWindow, adminSettings}: LaunchKaraokeSessionProps)
{

    const handleLaunchSession = async () => {
      try {
        // Create session in database first
        const sessionData: SessionCreate = {
          admin_user_id: adminId,
          session_title: adminSettings?.session_title,
          session_host: adminSettings?.session_host,
          use_all_songs: adminSettings?.use_all_songs,
          allow_song_reuse: adminSettings?.allow_song_reuse,
          session_mode: adminSettings?.session_mode || SessionMode.ORDER,
          songs_per_performer: adminSettings?.songs_per_performer,
          start_time: adminSettings?.start_time,
          end_time: adminSettings?.end_time,
          changeover_time: adminSettings?.changeover_time,
          performance_time: adminSettings?.performance_time,
          status: SessionStatus.ACTIVE
        };

        const session: Session = await SessionClient.create(sessionData);
        console.log('Session created successfully:', session);

        // Update state with the new session
        onUpdateSession(session);

        // Sync localStorage for backward compatibility
        localStorage.setItem(`karaoke_session_${adminId}`, 'active');

        // Open public window
        const publicWindow = window.open(`/public/${adminId}`, '_blank');
        if (publicWindow && onOpenPublicWindow) {
          onOpenPublicWindow(publicWindow);
        }
      } catch (error) {
        console.error('Error creating session:', error);
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