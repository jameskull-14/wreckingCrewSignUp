import { Settings } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../shared/Card";
import React from "react";
import ExportCSV from "./ExportCSV";
import LaunchSession from "./LaunchKaraokeSession";
import LaunchKaraokeSession from "./LaunchKaraokeSession";

export default function SessionHeader({

}){
    return(
        <div>
            <ExportCSV/>
            <LaunchKaraokeSession is_session_active={undefined}/>
        </div>
    );
}

