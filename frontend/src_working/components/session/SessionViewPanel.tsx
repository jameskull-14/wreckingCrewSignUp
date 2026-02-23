import { useEffect, useState } from "react";
import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./queue-card/QueuePanel";

export default function SessionViewPanel({
    pageView, 
    adminSettings
}: QueuePanelInterface){
    const [queuePanels, setQueuePanels] = useState();
    const [performers, setPerformers] = useState();

    const findPerformers = useEffect(()=>{
        
    }, [])

    useEffect(()=>{
        for(let i=0; i<=findPerformers.length; i++){

        }
    }, [])

    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <CardContent>
                    <QueuePanel
                        pageView={pageView}
                        adminSettings={adminSettings}
                    ></QueuePanel>
                </CardContent>
            </CardHeader>
        </Card>
    )
}