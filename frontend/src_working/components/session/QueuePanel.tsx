import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Button } from "../shared/Button";
import { Card, CardHeader, CardTitle } from "../shared/Card";

export default function QueuePanel({
    isAdmin, 
    adminSettings,
    performer
}: QueuePanelInterface){
    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <CardTitle className="text-2xl font-bold text-white">
                    Performer
                </CardTitle>
                {isAdmin && (
                    <Button>
                     My Button
                    </Button>
                )}
                
            </CardHeader>
        </Card>
    )
}