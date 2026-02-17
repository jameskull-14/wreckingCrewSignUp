import SessionModePanel from "./SessionModePanel.js";
import { AdminControlPanelProps } from "../../../../types/componentTypes/adminControlPanelProps.js";
import { Database, RefreshCw, Users } from "lucide-react";
import { Switch } from "../../../shared/Switch.js";
import { Label } from "../../../shared/Label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/Select.js";
import SongSettingsPanel from "./SongSettingsPanel.js";

export default function EventSettingsPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo
}: AdminControlPanelProps)
{
    
    const handleUpdateSession = async (field: 'use_all_songs' | 'allow_song_reuse', value: boolean) => {
        onUpdateAdminSettings({
            ...adminSettings,
            [field]: value
        })
    }

    const handleUpdateSongsPer = async (songsPerPerformer: number) => {
        onUpdateAdminSettings({
            ...adminSettings,
            songs_per_performer: songsPerPerformer
        })
    }
    
    return(
        <div>
            <SessionModePanel 
                onUpdateAdminSettings = {onUpdateAdminSettings}
                adminSettings={adminSettings}
                adminInfo = {adminInfo}
            />
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-400">Queueing</h3>
                <div key="performer-limit" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-cyan-400" />
                        <div>
                            <Label className="text-white font-semibold">Songs Per Performer</Label>
                            <p className="text-gray-400 text-sm">Set the max number of active sign-ups per person.</p>
                        </div>
                    </div>
                    <Select
                        value={(adminSettings?.songs_per_performer || 1).toString()}
                        onValueChange={(value) => handleUpdateSongsPer(parseInt(value))}
                    >
                        <SelectTrigger className="w-24 bg-gray-900/50 border-amber-400/30 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div key="allow-reuse" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-green-400" />
                        <div>
                            <Label className="text-white font-semibold">Allow Reuse of Songs</Label>
                            <p className="text-gray-400 text-sm">When enabled, songs can be selected multiple times</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{adminSettings?.allow_song_reuse ?? false ? 'On' : 'Off'}</span>
                        <Switch
                            checked={adminSettings?.allow_song_reuse ?? false}
                            onCheckedChange={() => handleUpdateSession('allow_song_reuse', !adminSettings?.allow_song_reuse)}
                        />
                    </div>
                </div>
                <div key="use-all-songs" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-blue-400" />
                        <div>
                        <Label className="text-white font-semibold">Use Entire Song Database</Label>
                        <p className="text-gray-400 text-sm">Toggle to use all songs or only selected ones</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{adminSettings?.use_all_songs ?? true ? 'On' : 'Off'}</span>
                        <Switch checked={adminSettings?.use_all_songs ?? true} onCheckedChange={() =>
                            handleUpdateSession('use_all_songs', !adminSettings?.use_all_songs)} />
                    </div>
                    
                </div>
                {adminSettings && !adminSettings.use_all_songs && (
                    <SongSettingsPanel
                        adminSettings={adminSettings}
                        onUpdateAdminSettings={onUpdateAdminSettings}
                        adminInfo = {adminInfo}
                    />
                )}
            </div>
        </div>
);
}
