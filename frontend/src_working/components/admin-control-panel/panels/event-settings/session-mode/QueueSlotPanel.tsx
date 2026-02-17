import { useState } from "react";
import { AdminControlPanelProps } from "../../../../../types/componentTypes/adminControlPanelProps";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Plus, Timer } from "lucide-react";
import { Label } from "../../../../shared/Label";
import { Input } from "../../../../shared/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";
import { Switch } from "../../../../shared/Switch";

const convertTo24Hour = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

const convertFrom24Hour = (time24: string): { hour: number; minute: number; period: 'AM' | 'PM' } => {
    const [hours, minutes] = time24.split(':').map(Number);
    let hour12 = hours;
    let period: 'AM' | 'PM' = 'AM';
  
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) hour12 = hours - 12;
    } else if (hours === 0) {
      hour12 = 12;
    }
  
    return { hour: hour12, minute: minutes, period };
  };

export default function QueueSlotPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo
}: AdminControlPanelProps){
    const [includeStartEndTime, setIncludeStartEndTime] = useState(false);

    const [startHour, setStartHour] = useState(() => {
        const time = convertFrom24Hour(adminSettings?.start_time || '19:00');
        return time.hour.toString();
    });
    const [startMinute, setStartMinute] = useState(() => {
        const time = convertFrom24Hour(adminSettings?.start_time || '19:00');
        return time.minute.toString().padStart(2, '0');
    });
    const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(() => {
        const time = convertFrom24Hour(adminSettings?.start_time || '19:00');
        return time.period;
    });
    const [endHour, setEndHour] = useState(() => {
        const time = convertFrom24Hour(adminSettings?.end_time || '23:00');
        return time.hour.toString();
    });
    const [endMinute, setEndMinute] = useState(() => {
        const time = convertFrom24Hour(adminSettings?.end_time || '23:00');
        return time.minute.toString().padStart(2, '0');
    });
    const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(() => {
        const time = convertFrom24Hour(adminSettings?.end_time || '23:00');
        return time.period;
    });

    const [showToast, setShowToast] = useState(false);

    const handleTimeChange = () => {
        
        const startHourNum = parseInt(startHour) || 1;
        const startMinuteNum = parseInt(startMinute) || 0;
        const endHourNum = parseInt(endHour) || 1;
        const endMinuteNum = parseInt(endMinute) || 0;

        const start24 = convertTo24Hour(
            Math.max(1, Math.min(12, startHourNum)),
            Math.max(0, Math.min(59, startMinuteNum)),
            startPeriod
        );
        const end24 = convertTo24Hour(
            Math.max(1, Math.min(12, endHourNum)),
            Math.max(0, Math.min(59, endMinuteNum)),
            endPeriod
        );
        onUpdateAdminSettings({
            ...adminSettings,
            start_time: start24,
            end_time: end24
        })

        // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    return(
        <>
        {showToast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px]">
              <p className="font-semibold mb-2">Your changes have been saved</p>
              <div className="w-full bg-green-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all"
                  style={{
                    width: '100%',
                    animation: 'shrink 3s linear forwards'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
        <Card className="bg-gray-800/50 border-amber-400/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Advanced Time Slot Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <Label htmlFor="include-time" className="text-white font-medium">
                Include Start/End Time
              </Label>
              <Switch
                id="include-time"
                checked={includeStartEndTime}
                onCheckedChange={setIncludeStartEndTime}
              />
            </div>
            {/* {includeStartEndTime && ( */}
            <><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-white">Start Time</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    placeholder="Hour"
                                    value={startHour}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) {
                                            setStartHour(val);
                                        }
                                    } }
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm" />
                                <span className="text-white">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="Min"
                                    value={startMinute}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) {
                                            setStartMinute(val);
                                        }
                                    } }
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm" />
                                <Select
                                    value={startPeriod}
                                    onValueChange={(value) => setStartPeriod(value as 'AM' | 'PM')}
                                >
                                    <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white w-24 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AM">AM</SelectItem>
                                        <SelectItem value="PM">PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-white">End Time</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    placeholder="Hour"
                                    value={endHour}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) {
                                            setEndHour(val);
                                        }
                                    } }
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm" />
                                <span className="text-white">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="Min"
                                    value={endMinute}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) {
                                            setEndMinute(val);
                                        }
                                    } }
                                    onFocus={(e) => e.target.select()}
                                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm" />
                                <Select
                                    value={endPeriod}
                                    onValueChange={(value) => setEndPeriod(value as 'AM' | 'PM')}
                                >
                                    <SelectTrigger className="bg-gray-900/50 border-amber-400/30 text-white w-24 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AM">AM</SelectItem>
                                        <SelectItem value="PM">PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div><Button
                        onClick={handleTimeChange}
                        className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                    >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Start / End Time
                        </Button></>
            {/* )} */}
          </CardContent>
        </Card>
        </>
    );
}