import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Plus, Timer } from "lucide-react";
import { Input } from "../../../../shared/Input";
import { Label } from "../../../../shared/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";

export default function TimeSlotPanel()
{
    return(
        <Card className="bg-gray-800/50 border-amber-400/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Advanced Time Slot Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Time</Label>
                <Input
                  type="time"
                  value={activeSession?.start_time || '19:00'}
                  onChange={(e) => handleTimeChange('start_time', e.target.value)}
                  className="bg-gray-900/50 border-amber-400/30 text-white"
                />
              </div>
              <div>
                <Label className="text-white">End Time</Label>
                <Input
                  type="time"
                  value={activeSession?.end_time || '23:00'}
                  onChange={(e) => handleTimeChange('end_time', e.target.value)}
                  className="bg-gray-900/50 border-amber-400/30 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Performance Time (minutes)</Label>
                <Select 
                  value={activeSession?.time_increment?.toString() || '15'} 
                  onValueChange={handleIncrementChange}
                >
                  <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(minutes => (
                      <SelectItem key={minutes} value={minutes.toString()}>
                        {minutes} minute{minutes !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white">Changeover Time (minutes)</Label>
                <Select 
                  value={activeSession?.changeover_time?.toString() || '0'} 
                  onValueChange={handleChangeoverChange}
                >
                  <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => i).map(minutes => (
                      <SelectItem key={minutes} value={minutes.toString()}>
                        {minutes} minute{minutes !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-gray-900/30 rounded-lg p-4">
              <div className="text-sm text-gray-300 mb-2">
                <strong>Example:</strong> Performance Time: {activeSession?.time_increment || 15}min, 
                Changeover: {activeSession?.changeover_time || 0}min
              </div>
              <div className="text-xs text-gray-400">
                Total slot spacing: {(activeSession?.time_increment || 15) + (activeSession?.changeover_time || 0)} minutes
                {activeSession?.changeover_time > 0 && (
                  <span className="block mt-1">
                    Each slot includes {activeSession?.time_increment || 15} minutes performance + {activeSession?.changeover_time} minutes changeover
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateSlots}
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate New Time Slots
            </Button>
          </CardContent>
        </Card>
    )
}