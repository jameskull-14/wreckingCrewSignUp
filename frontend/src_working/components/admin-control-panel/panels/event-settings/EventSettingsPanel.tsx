import React from "react";
import SessionModePanel from "./SessionModePanel.js";
import { AdminControlPanelProps } from "../../../../types/componentTypes/AdminControlPanelProps.js";

export default function EventSettingsPanel({
    adminSettings,
    onUpdateAdminSettings
}: AdminControlPanelProps)
{
    
    return(
        <div>
            <SessionModePanel onUpdateAdminSettings = {onUpdateAdminSettings}/>
        </div>
);
}
