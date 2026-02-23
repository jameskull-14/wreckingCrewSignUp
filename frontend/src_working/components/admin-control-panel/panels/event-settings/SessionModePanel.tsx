import QueueSlotPanel from "./session-mode/QueueSlotPanel.js";
import TimeSlotPanel from "./session-mode/TimeSlotPanel.js";
import { CardContent } from "../../../shared/Card.js";
import { Clock, List } from "lucide-react";
import { SettingsPanelBaseProps } from "../../../../types/componentTypes/navigationContentProps.js";

export default function SessionModePanel({
  adminSettings,
  onUpdateAdminSettings,
  adminInfo
}: SettingsPanelBaseProps)
{

  const handleModeChange = (mode: string) =>{
    onUpdateAdminSettings({
      ...adminSettings,
      session_mode: mode
    })
  }
    return(
        <div>
            <CardContent className="space-y-4">
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                adminSettings?.session_mode === 'Time'
                  ? 'border-amber-400 bg-amber-400/20'
                  :
                  'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('Time')}
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
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all
              ${
                adminSettings?.session_mode === 'Order'
                  ? 'border-amber-400 bg-amber-400/20'
                  :
                  'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('Order')}
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
            {adminSettings?.session_mode === 'Time' && (
              <div className="mt-6">
                <TimeSlotPanel
                  adminSettings = {adminSettings}
                  onUpdateAdminSettings = {onUpdateAdminSettings}
                  adminInfo = {adminInfo}
                />
              </div>
            )}
            {adminSettings?.session_mode === 'Order' && (
              <div className="mt-6">
                <QueueSlotPanel
                  adminSettings = {adminSettings}
                  onUpdateAdminSettings = {onUpdateAdminSettings}
                  adminInfo = {adminInfo}
                />
              </div>
            )}
          
        </CardContent>
        </div>
    )
}

