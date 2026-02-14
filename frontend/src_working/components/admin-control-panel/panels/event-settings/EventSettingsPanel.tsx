import React from "react";
import SessionModePanel from "./SessionModePanel.js";

export default function EventSettingsPanel({
    activeSession
})
{
    const hadnleUpdateSession = async(updates) => {
        try{
            await 
        }
    }
    return(
        <div>
            <SessionModePanel
                activeSession = {activeSession}
                onUpdateSession={handleUpdateSession}
            />

        </div>
);
}
