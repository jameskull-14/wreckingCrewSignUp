import { useState } from "react";
import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Button } from "../shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/Card";

export default function QueuePanel({
    isAdmin, 
    adminSettings, 
    performer,
    performerSongSelections
}: QueuePanelInterface){

    const mergePerformerInfo = performerSongSelections.filter(selection => selection.performer_id === performer.performer_id)
    
    

    
    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <CardTitle className="text-2xl font-bold text-white">
                    Performer: {performer.performer_name}
                </CardTitle>
                    <CardContent>
                        {mergePerformerInfo.length > 0 ? (
                            <div className="space-y-2">
                                {mergePerformerInfo.map((selection, index) => (
                                    <div key={selection.performer_selection_id} className="text-white">
                                        <span className="text-amber-400">Song {index + 1}:</span>{' '}
                                        {selection.song_title || 'Unknown Song'} - {selection.artist || 'Unknown Artist'}
                                        {adminSettings?.allow_instrument_use && (
                                            <>
                                                {' '}({selection.is_singing ? " Singing " : ""}
                                                {selection.instrument ? ` - ${selection.instrument}` : ""})
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No songs selected</p>
                        )}
                    </CardContent>
                {isAdmin && (
                    <Button>
                     My Button
                    </Button>
                )}
                
            </CardHeader>
        </Card>
    )
}