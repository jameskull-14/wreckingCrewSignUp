import { Card, CardContent } from "../../../shared/Card.js";
import { Clock, Music, Users } from "lucide-react";
import SessionViewPanel from "../../../session/SessionViewPanel.js";
import { AdminUserSetting } from "../../../../types/apiTypes/adminUserSetting.js";
import { Session } from "../../../../types/apiTypes/session.js";
import { useWebSocket } from "../../../../context/WebSocketContext.js";
import { PerformerClient, PerformerSongSelectionClient } from "../../../../api/frontendClient.js";
import React, { useState, useEffect, useCallback } from "react";

interface OverviewPanelProps {
  adminSettings: AdminUserSetting | null;
  activeSession: Session | null;
}

export default function OverviewPanel({ adminSettings, activeSession }: OverviewPanelProps) {
  const { subscribe } = useWebSocket();
  const [performerCount, setPerformerCount] = useState(0);
  const [songCount, setSongCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!activeSession) {
      setPerformerCount(0);
      setSongCount(0);
      return;
    }

    try {
      // Fetch performers count
      const performers = await PerformerClient.list(activeSession.session_id.toString());
      setPerformerCount(Array.isArray(performers) ? performers.length : 0);

      // Fetch performer song selections count (songs signed up by performers)
      const songSelections = await PerformerSongSelectionClient.get(activeSession.session_id.toString());
      setSongCount(Array.isArray(songSelections) ? songSelections.length : 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, [activeSession]);

  // Fetch counts on mount and when session changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Subscribe to WebSocket updates for real-time counts
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === 'performer_created' || message.type === 'performer_updated') {
        // Refresh counts when performers change
        setTimeout(() => {
          fetchCounts();
        }, 500);
      }
    });

    return unsubscribe;
  }, [subscribe, fetchCounts]);

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
                <div className="text-2xl font-bold text-white">{performerCount}</div>
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
                <div className="text-2xl font-bold text-white">{adminSettings?.max_slots ? Math.max(0, adminSettings.max_slots - performerCount) : 0}</div>
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

      {activeSession && (
        <SessionViewPanel
          isAdmin={true}
          adminSettings={adminSettings}
          sessionId={activeSession.session_id.toString()}
        />
      )}
    </div>
  );
}