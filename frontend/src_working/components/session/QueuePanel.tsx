import { useState } from "react";
import { QueuePanelInterface } from "../../types/componentTypes/queuePanelProps";
import { Button } from "../shared/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/Card";
import { Pencil } from "lucide-react";
import { PerformerType } from "../../types/apiTypes/performer";

export default function QueuePanel({
    isAdmin,
    adminSettings,
    performer,
    performerSongSelections,
    onEdit
}: QueuePanelInterface){

    const mergePerformerInfo = performerSongSelections.filter(selection => selection.performer_id === performer.performer_id)
    const displayName = performer.performer_type === PerformerType.group
        ? `Band: ${performer.performer_name}`
        : performer.performer_name
    
    

    
    return(
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl font-bold text-white">
                        {displayName}
                    </CardTitle>
                    {isAdmin && onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-md transition-colors"
                            title="Edit performer"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>
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
            </CardHeader>
        </Card>
    )
}