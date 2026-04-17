import { useState } from "react";
import { Button } from "../../shared/Button.js";
import { Rocket } from "lucide-react";
import { AdminUserSetting } from "../../../types/apiTypes/adminUserSetting.js";
import { Session, SessionCreate, SessionStatus, SessionMode } from "../../../types/apiTypes/session.js";
import { SessionClient } from "../../../api/frontendClient.js";
import SimpleToast, { ToastType } from "../../shared/SimpleToast.js";

interface LaunchKaraokeSessionProps {
    onUpdateSession: (session: Session | null) => void;
    adminId: number;
    onOpenPublicWindow?: (window: Window) => void;
    adminSettings: AdminUserSetting | null;
}

export default function LaunchKaraokeSession({
  onUpdateSession,
  adminId,
  onOpenPublicWindow,
  adminSettings
}: LaunchKaraokeSessionProps){
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const handleLaunchSession = async () => {
      console.log('🚀 Launch Session button clicked');
      console.log('Admin ID:', adminId);
      console.log('Admin Settings:', adminSettings);

      try {
        // Create session in database first
        const sessionData: SessionCreate = {
          admin_user_id: adminId,
          session_title: adminSettings?.session_title,
          session_host: adminSettings?.session_host,
          use_all_songs: adminSettings?.use_all_songs,
          allow_song_reuse: adminSettings?.allow_song_reuse,
          session_mode: adminSettings?.session_mode || SessionMode.Order,
          songs_per_performer: adminSettings?.songs_per_performer,
          allow_instrument_use: adminSettings?.allow_instrument_use,
          start_time: adminSettings?.start_time,
          end_time: adminSettings?.end_time,
          changeover_time: adminSettings?.changeover_time,
          performance_time: adminSettings?.performance_time,
          status: SessionStatus.Active
        };

        console.log('📤 Creating session with data:', sessionData);
        const session: Session = await SessionClient.create(sessionData);
        console.log('✅ Session created successfully:', session);
        console.log('Session ID:', session.session_id);

        // Update state with the new session
        console.log('📢 Calling onUpdateSession...');
        onUpdateSession(session);

        // Sync localStorage for backward compatibility
        localStorage.setItem(`karaoke_session_${adminId}`, 'active');
        console.log('💾 localStorage updated');

        // Open public window
        const publicUrl = `/public_session/${adminId}/${session.session_id}`;
        console.log('🌐 Opening public window with URL:', publicUrl);
        const publicWindow = window.open(publicUrl, '_blank');

        if (publicWindow) {
          console.log('✅ Public window opened successfully');
          setToast({ message: 'Session launched successfully!', type: 'success' });
          if (onOpenPublicWindow) {
            onOpenPublicWindow(publicWindow);
          }
        } else {
          console.error('❌ Failed to open public window - popup might be blocked');
          setToast({ message: 'Session created! Check for popup blocker.', type: 'warning' });
        }
      } catch (error) {
        console.error('❌ Error creating session:', error);
        setToast({ message: 'Failed to create session. Check console.', type: 'error' });
      }
    }

    return(
        <>
          {toast && (
            <SimpleToast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
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
        </>
    )
}