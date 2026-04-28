import SessionModePanel from "./SessionModePanel.js";
import { SettingsPanelBaseProps } from "../../../../types/componentTypes/navigationContentProps.js";
import { Database, RefreshCw, Users, Guitar, Eye, Music, MessageSquare } from "lucide-react";
import { Switch } from "../../../shared/Switch.js";
import { Label } from "../../../shared/Label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/Select.js";
import { useState, useEffect } from "react";
import { CardContent } from "../../../shared/Card.js";
import { Input } from "../../../shared/Input.js";
import { Button } from "../../../shared/Button.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../shared/Tabs.js";

export default function EventSettingsPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo,
    activeSession
}: SettingsPanelBaseProps)
{
    const [newTitle, setNewTitle] = useState(adminSettings?.session_title || '');
    const [newHost, setNewHost] = useState(adminSettings?.session_host || '');

    useEffect(() => {
        if (adminSettings?.session_title) {
            setNewTitle(adminSettings.session_title);
        }
        if (adminSettings?.session_host !== undefined) {
            setNewHost(adminSettings.session_host || '');
        }
    }, [adminSettings?.session_title, adminSettings?.session_host]);

    const handleUpdateSession = async (field: 'use_all_songs' | 'allow_song_reuse' | 'allow_instrument_use' | 'show_performer_status' | 'show_song_status' | 'allow_performer_notes', value: boolean) => {
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

    const handleSaveChanges = () => {
        onUpdateAdminSettings({
            ...adminSettings,
            session_title: newTitle,
            session_host: newHost
        });
    }

    
    return(
        <div>
        <Tabs defaultValue="general">
            <TabsList className="mb-4 bg-gray-800/50 border border-amber-400/20">
                <TabsTrigger value="general" className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400 text-gray-400">General</TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400 text-gray-400">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="font-semibold text-white">Session Title</div>
                        <Input
                            value={newTitle}
                            placeholder="Enter session title"
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-gray-800/50 border-amber-400/30 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="font-semibold text-white">Hosted By</div>
                        <Input
                            value={newHost}
                            placeholder="Enter host name"
                            onChange={(e) => setNewHost(e.target.value)}
                            className="bg-gray-800/50 border-amber-400/30 text-white"
                        />
                    </div>
                </div>
                <Button
                    onClick={handleSaveChanges}
                    style={{ backgroundColor: '#10b981', color: 'white', border: '1px solid #34d399' }}
                    className="hover:!bg-emerald-600 shadow"
                >
                    Save
                </Button>
            </CardContent>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-400">General</h3>
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
                <div key="allow-instruments" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <Guitar className="w-6 h-6 text-purple-400" />
                        <div>
                            <Label className="text-white font-semibold">Allow Instrument Use</Label>
                            <p className="text-gray-400 text-sm">When enabled, performers can specify if they're using an instrument</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{adminSettings?.allow_instrument_use ?? false ? 'On' : 'Off'}</span>
                        <Switch
                            checked={adminSettings?.allow_instrument_use ?? false}
                            onCheckedChange={() => handleUpdateSession('allow_instrument_use', !adminSettings?.allow_instrument_use)}
                        />
                    </div>
                </div>
                {/* <div key="use-all-songs" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
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

                </div> */}
            </div>
            <div style={{ marginTop: '32px', marginBottom: '16px' }}>
                <h3 className="text-lg font-semibold text-amber-400">Queueing</h3>
            </div>
            <SessionModePanel
                onUpdateAdminSettings = {onUpdateAdminSettings}
                adminSettings={adminSettings}
                adminInfo = {adminInfo}
                activeSession = {activeSession}
            />
            </TabsContent>
            <TabsContent value="advanced">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                            <Eye className="w-6 h-6 text-amber-400" />
                            <div>
                                <Label className="text-white font-semibold">Show Performer Status</Label>
                                <p className="text-gray-400 text-sm">When off, performer status is hidden from admins and the public</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{adminSettings?.show_performer_status ?? true ? 'On' : 'Off'}</span>
                            <Switch
                                checked={adminSettings?.show_performer_status ?? true}
                                onCheckedChange={() => handleUpdateSession('show_performer_status', !(adminSettings?.show_performer_status ?? true))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                            <Music className="w-6 h-6 text-amber-400" />
                            <div>
                                <Label className="text-white font-semibold">Show Song Status</Label>
                                <p className="text-gray-400 text-sm">When off, song status is hidden from admins and the public</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{adminSettings?.show_song_status ?? true ? 'On' : 'Off'}</span>
                            <Switch
                                checked={adminSettings?.show_song_status ?? true}
                                onCheckedChange={() => handleUpdateSession('show_song_status', !(adminSettings?.show_song_status ?? true))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-amber-400" />
                            <div>
                                <Label className="text-white font-semibold">Allow Performer Notes</Label>
                                <p className="text-gray-400 text-sm">When on, performers can add a private note visible only to the host</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">{adminSettings?.allow_performer_notes ?? true ? 'On' : 'Off'}</span>
                            <Switch
                                checked={adminSettings?.allow_performer_notes ?? true}
                                onCheckedChange={() => handleUpdateSession('allow_performer_notes', !(adminSettings?.allow_performer_notes ?? true))}
                            />
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
        </div>
);
}
