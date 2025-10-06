import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, List, Timer, Plus } from "lucide-react";

export default function SchedulingSettings({ 
  activeSession, 
  onUpdateSession,
  onGenerateSlots 
}) {
  const handleTimeChange = (field, value) => {
    onUpdateSession({ [field]: value });
  };

  const handleModeChange = (mode) => {
    onUpdateSession({ session_mode: mode });
  };

  const handleIncrementChange = (increment) => {
    onUpdateSession({ time_increment: parseInt(increment) });
  };

  const handleChangeoverChange = (changeover) => {
    onUpdateSession({ changeover_time: parseInt(changeover) });
  };

  const handleGenerateSlots = () => {
    onGenerateSlots();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-amber-400/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeSession?.session_mode === 'time_slot' 
                  ? 'border-amber-400 bg-amber-400/20' 
                  : 'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('time_slot')}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Time Slot Mode</div>
                  <div className="text-gray-400 text-sm">Users sign up for specific time slots</div>
                </div>
              </div>
            </div>
            
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeSession?.session_mode === 'order' 
                  ? 'border-amber-400 bg-amber-400/20' 
                  : 'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
              }`}
              onClick={() => handleModeChange('order')}
            >
              <div className="flex items-center gap-3">
                <List className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Order Mode</div>
                  <div className="text-gray-400 text-sm">Users sign up in queue order (no specific times)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeSession?.session_mode === 'time_slot' && (
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
      )}
    </div>
  );
}