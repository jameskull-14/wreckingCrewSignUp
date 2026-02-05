import React from "react";
import QueueSlotPanel from "./session-mode/QueueSlotPanel.js";
import TimeSlotPanel from "./session-mode/TimeSlotPanel.js";
import { CardContent } from "../../../shared/Card.js";
import { Clock, List } from "lucide-react";

export default function SessionModePanel({
    activeSession,
    onUpdateSession
})
{
    const handleModeChange = (mode) => {
        onUpdateSession({ session_mode: mode });
      };
    return(
        <div>
            <CardContent className="space-y-4">
          <div className="space-y-3">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeSession?.session_mode === 'time_slot' 
                  ? 'border-amber-400 bg-amber-400/20' 
                  : 'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('time_slot')}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Time Slot Mode</div>
                  <div className="text-gray-400 text-sm">Users sign up for specific time slots</div>
                </div>
              </div>
            </div>
            
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeSession?.session_mode === 'order' 
                  ? 'border-amber-400 bg-amber-400/20' 
                  : 'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('order')}
            >
              <div className="flex items-center gap-3">
                <List className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Order Mode</div>
                  <div className="text-gray-400 text-sm">Users sign up in queue order (no specific times)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Render mode-specific options*/}
          {activeSession?.session_mode === 'time_slot' && (
            <div className="mt-6">
              <TimeSlotPanel activeSession={activeSession} onUpdateSession={onUpdateSession} />
            </div>
          )}

          {activeSession?.session_mode === 'order' && (
            <div className="mt-6">
              <QueueSlotPanel activeSession={activeSession} onUpdateSession={onUpdateSession} />
            </div>
          )}
        </CardContent>
        </div>
    )
}

