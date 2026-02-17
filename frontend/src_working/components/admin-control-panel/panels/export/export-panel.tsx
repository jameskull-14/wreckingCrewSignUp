import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";

export default function ExportPanel({}){

    
    return(
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    Export Previous Sessions
                </CardTitle>
            </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
    )
}