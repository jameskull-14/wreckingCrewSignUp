import React from "react";
import { Card, CardHeader, CardTitle } from "../shared/Card.js";
import { Settings } from "lucide-react";
import ExportCSV from "./header/ExportCSV.js";
import LaunchKaraokeSession from "./header/LaunchKaraokeSession.js";

export default function AdminControlPanel({}){
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
                    <ExportCSV/>
                    <LaunchKaraokeSession is_session_active={false}/>
                </div>
            </CardHeader>
        </Card>
    );
}