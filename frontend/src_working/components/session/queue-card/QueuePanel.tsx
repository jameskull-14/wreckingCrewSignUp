import { QueuePanelInterface } from "../../../types/componentTypes/queuePanelProps";
import QueueItem from "./QueueItem";

export default function QueuePanel({
    pageView, 
    adminSettings
}: QueuePanelInterface){
    return(
        <div>
            <QueueItem
                pageView={pageView}
                adminSettings={adminSettings}
            ></QueueItem>
        </div>
    )
}