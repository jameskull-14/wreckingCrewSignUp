import QueueSlotPanel from "./session-mode/QueueSlotPanel.js";
import TimeSlotPanel from "./session-mode/TimeSlotPanel.js";

export default function SessionModePanel()
{
    return(
        <div>
            <TimeSlotPanel/>
            <QueueSlotPanel/>
        </div>
    )
}

