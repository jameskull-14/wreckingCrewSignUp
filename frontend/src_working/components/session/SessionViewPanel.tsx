import { useEffect, useState } from "react";
import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Card, CardContent, CardHeader } from "../shared/Card";
import QueuePanel from "./QueuePanel";
import { Button } from "../shared/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shared/Dialog";
import { Plus } from "lucide-react";
import SignUpPanel from "./SignUpPanel";

export default function SessionViewPanel({
    pageView, 
    adminSettings
}: QueuePanelInterface){
    const [queuePanels, setQueuePanels] = useState();
    const [performers, setPerformers] = useState([]);

    useEffect(()=>{
        const fetchPerformers = async () => {
            try {
                const response = await fetch(`api/sessions?admin_user_id=${adminSettings?.admin_user_id}`);
                const data = await response.json();
                setPerformers(data);
            } catch(error) {
                console.error('Failed to load Performer data: ', error);
            }
        }

        fetchPerformers();
    }, [adminSettings?.admin_user_id])

    return(
        <div>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                <CardHeader className="border-b border-amber-400/20">
                    <CardContent>
                        {performers.map((performer, index) => (
                            <QueuePanel
                                key={index}
                                pageView={pageView}
                                adminSettings={adminSettings}
                            />
                        ))}
                    </CardContent>
                </CardHeader>
            </Card>
            <div className="flex justify-center mt-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="flex items-center gap-2"
                            style={{ backgroundColor: '#16a34a' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                        >
                            <Plus className="h-5 w-5" />
                            Sign Up
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
                        <DialogHeader>
                            <DialogTitle className="text-amber-400">Sign Up for Performance</DialogTitle>
                        </DialogHeader>
                        <SignUpPanel 
                            adminSettings={adminSettings}
                             />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}