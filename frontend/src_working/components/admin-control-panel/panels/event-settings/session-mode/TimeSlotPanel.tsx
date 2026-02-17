import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Plus, Timer } from "lucide-react";
import { Input } from "../../../../shared/Input";
import { Label } from "../../../../shared/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";
import { AdminControlPanelProps } from "../../../../../types/componentTypes/adminControlPanelProps";

// Helper functions outside component
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

const convertTo24Hour = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
  let hour24 = hour;
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export default function TimeSlotPanel({
    adminSettings,
    onUpdateAdminSettings,
    adminInfo
}: AdminControlPanelProps) {

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
    const [changeoverMinute, setChangeoverMinute] = useState(() => {
        const [hours, minutes] =
    (adminSettings?.changeover_time ||
    '00:05').split(':');
        return minutes;
    })
    const [changeoverHour, setChangeoverHour] = useState(() => {
        const [hours, minutes] =
    (adminSettings?.changeover_time ||
    '00:05').split(':');
        return hours;
    })
    const [performanceMinute, setPerformanceMinute] = useState(() => {
        const [hours, minutes] =
    (adminSettings?.performance_time ||
    '00:15').split(':');
        return minutes;
    })
    const [performanceHour, setPerformanceHour] = useState(() => {
        const [hours, minutes] =
    (adminSettings?.performance_time ||
    '00:15').split(':');
        return hours;
    })

    const [showToast, setShowToast] = useState(false);

    const handleTimeIncrementChange = (field: 'start_time' |
    'end_time' | 'changeover_time' | 'performance_time', value: string) =>
      {
        onUpdateAdminSettings({
          ...adminSettings!,
          [field]: value
        })
      };

    const handleDurationChange = (field: 'changeover_time' | 'performance_time', type: 'hours' | 'minutes', value: string) => {
      const currentValue = adminSettings?.[field] || '00:00';
      const [currentHours, currentMinutes] = currentValue.split(':');

      const hours = type === 'hours' ? value.padStart(2, '0') : currentHours;
      const minutes = type === 'minutes' ? value.padStart(2, '0') : currentMinutes;

      const newValue = `${hours}:${minutes}`;
      handleTimeIncrementChange(field, newValue);
    };

    const handleGenerateSlots = () => {
      // Validate and convert to 24-hour format
      const startHourNum = parseInt(startHour) || 1;
      const startMinuteNum = parseInt(startMinute) || 0;
      const endHourNum = parseInt(endHour) || 1;
      const endMinuteNum = parseInt(endMinute) || 0;
      const changeoverMinuteNum = parseInt(changeoverMinute) || 5;
      const changeoverHourNum = parseInt(changeoverHour) || 0
      const performanceMinuteNum = parseInt(performanceMinute) || 15;
      const performanceHourNum = parseInt(performanceHour) || 0

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

      const changeoverFinal =
      `${changeoverHourNum.toString().padStart(2, '0')
      }:${changeoverMinuteNum.toString().padStart(2, 
      '0')}`;

      const performanceFinal =
      `${performanceHourNum.toString().padStart(2, '0'
      )}:${performanceMinuteNum.toString().padStart(2,
      '0')}`;

      // Update admin settings with all time fields
      onUpdateAdminSettings({
        ...adminSettings!,
        start_time: start24,
        end_time: end24,
        changeover_time: changeoverFinal,
        performance_time: performanceFinal,
      });

      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
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
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
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
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
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
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Label className="text-white whitespace-nowrap">Performance Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="Hour"
                    value={performanceHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if(val === '' || (val.length <= 2)){
                        setPerformanceHour(val)
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{ width: '80px' }}
                    className="bg-gray-900/50 border-amber-400/30 text-white text-sm"
                  />
                  <span className="text-white text-sm">Hours</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minute"
                    value={performanceMinute}
                    onChange={(e) => {
                      const val = e.target.value;
                      if(val === '' || (val.length <= 2 && parseInt(val) <= 59)){
                        setPerformanceMinute(val)
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{ width: '80px' }}
                    className="bg-gray-900/50 border-amber-400/30 text-white text-sm"
                  />
                  <span className="text-white text-sm">Minutes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Label className="text-white whitespace-nowrap">Changeover Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="Hour"
                    value={changeoverHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if(val === '' || (val.length <= 2)){
                        setChangeoverHour(val)
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{ width: '80px' }}
                    className="bg-gray-900/50 border-amber-400/30 text-white text-sm"
                  />
                  <span className="text-white text-sm">Hours</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minute"
                    value={changeoverMinute}
                    onChange={(e) => {
                      const val = e.target.value;
                      if(val === '' || (val.length <= 2 && parseInt(val) <= 59)){
                        setChangeoverMinute(val)
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{ width: '80px' }}
                    className="bg-gray-900/50 border-amber-400/30 text-white text-sm"
                  />
                  <span className="text-white text-sm">Minutes</span>
                </div>
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
        </>
    )
}