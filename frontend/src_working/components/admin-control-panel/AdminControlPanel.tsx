import { Card, CardHeader, CardTitle } from "../shared/Card.js";
import { Settings } from "lucide-react";
import LaunchKaraokeSession from "./header/LaunchKaraokeSession.js";
import NavigationContent from "./navigation/NavigationContent.js";
import {AdminControlPanelProps} from "../../types/componentTypes/adminControlPanelProps.js"


export default function AdminControlPanel({
    adminSettings,
    onUpdateAdminSettings, 
    adminInfo
}: AdminControlPanelProps) {
    
    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-900" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                        Admin Control Panel
                        </CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <LaunchKaraokeSession is_session_active={false}/>
                    </div>
                    <NavigationContent
                        adminSettings = {adminSettings}
                        onUpdateAdminSettings = {onUpdateAdminSettings}
                        adminInfo = {adminInfo}
                    />
                </div>
            </CardHeader>
        </Card>
    );
}