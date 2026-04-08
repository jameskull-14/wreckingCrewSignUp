import { SettingsPanelBaseProps } from "../../../../types/componentTypes/navigationContentProps";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { Label } from "../../../shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/Select";
import { useState } from "react";
import SongSearch from "../../../SongSearch";

export default function SongSettingsPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo
}: SettingsPanelBaseProps)
{
    const [selectedTheme, setSelectedTheme] = useState<string>("");

    return(
        <div>
            <Card className="bg-gray-800/50 border-amber-400/20">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    Song Selection
                    </CardTitle>
                    <div className="text-gray-400 text-sm">Select what songs or themes you want to be available to the performers</div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-white">Theme</Label>
                        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                            <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="60s">60's</SelectItem>
                                <SelectItem value="70s">70's</SelectItem>
                                <SelectItem value="80s">80's</SelectItem>
                                <SelectItem value="90s">90's</SelectItem>
                                <SelectItem value="00s">00's</SelectItem>
                                <SelectItem value="10s">10's</SelectItem>
                                <SelectItem value="20s">20's</SelectItem>
                                <SelectItem value="punk">Punk</SelectItem>
                                <SelectItem value="musical">Musical</SelectItem>
                                <SelectItem value="rock">Rock</SelectItem>
                                <SelectItem value="pop">Pop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <SongSearch adminUserId={adminInfo?.admin_user_id} />
                </CardContent>
            </Card>
        </div>
    )
}