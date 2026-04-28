import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Timer } from "lucide-react";
import { Input } from "../../../../shared/Input";
import { Label } from "../../../../shared/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";
import { SettingsPanelBaseProps } from "../../../../../types/componentTypes/navigationContentProps";
import { SessionClient } from "../../../../../api/frontendClient";
import FeaturedActPanel from "./FeaturedActPanel";
import CustomLinkPanel from "./CustomLinkPanel";

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
    adminInfo,
    activeSession
}: SettingsPanelBaseProps) {

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

    // Featured Act state
    const [featuredActName, setFeaturedActName] = useState(adminSettings?.featured_act_name || '');
    const [featuredActStartHour, setFeaturedActStartHour] = useState(() => {
        if (adminSettings?.featured_act_start_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_start_time);
            return time.hour.toString();
        }
        return '';
    });
    const [featuredActStartMinute, setFeaturedActStartMinute] = useState(() => {
        if (adminSettings?.featured_act_start_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_start_time);
            return time.minute.toString().padStart(2, '0');
        }
        return '';
    });
    const [featuredActStartPeriod, setFeaturedActStartPeriod] = useState<'AM' | 'PM'>(() => {
        if (adminSettings?.featured_act_start_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_start_time);
            return time.period;
        }
        return 'PM';
    });
    const [featuredActEndHour, setFeaturedActEndHour] = useState(() => {
        if (adminSettings?.featured_act_end_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_end_time);
            return time.hour.toString();
        }
        return '';
    });
    const [featuredActEndMinute, setFeaturedActEndMinute] = useState(() => {
        if (adminSettings?.featured_act_end_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_end_time);
            return time.minute.toString().padStart(2, '0');
        }
        return '';
    });
    const [featuredActEndPeriod, setFeaturedActEndPeriod] = useState<'AM' | 'PM'>(() => {
        if (adminSettings?.featured_act_end_time) {
            const time = convertFrom24Hour(adminSettings.featured_act_end_time);
            return time.period;
        }
        return 'PM';
    });

    // Featured Act Link state
    const [featuredActLinkUrl, setFeaturedActLinkUrl] = useState(adminSettings?.featured_act_link_url || '');
    const [featuredActLinkText, setFeaturedActLinkText] = useState(adminSettings?.featured_act_link_text || '');

    // Custom Link state
    const [customLinkUrl, setCustomLinkUrl] = useState(adminSettings?.custom_link_url || '');
    const [customLinkPrompt, setCustomLinkPrompt] = useState(adminSettings?.custom_link_prompt || '');
    const [customLinkText, setCustomLinkText] = useState(adminSettings?.custom_link_text || '');

    const [showToast, setShowToast] = useState(false);

    const handleGenerateSlots = async () => {
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

      // Convert featured act times to 24-hour format if provided
      let featuredActStart24 = null;
      let featuredActEnd24 = null;
      if (featuredActStartHour && featuredActStartMinute) {
        const featActStartHourNum = parseInt(featuredActStartHour) || 1;
        const featActStartMinuteNum = parseInt(featuredActStartMinute) || 0;
        featuredActStart24 = convertTo24Hour(
          Math.max(1, Math.min(12, featActStartHourNum)),
          Math.max(0, Math.min(59, featActStartMinuteNum)),
          featuredActStartPeriod
        );
      }
      if (featuredActEndHour && featuredActEndMinute) {
        const featActEndHourNum = parseInt(featuredActEndHour) || 1;
        const featActEndMinuteNum = parseInt(featuredActEndMinute) || 0;
        featuredActEnd24 = convertTo24Hour(
          Math.max(1, Math.min(12, featActEndHourNum)),
          Math.max(0, Math.min(59, featActEndMinuteNum)),
          featuredActEndPeriod
        );
      }

      // Update admin settings with all time fields
      const updatedSettings = {
        ...adminSettings!,
        start_time: start24,
        end_time: end24,
        changeover_time: changeoverFinal,
        performance_time: performanceFinal,
        featured_act_name: featuredActName || undefined,
        featured_act_start_time: featuredActStart24 || undefined,
        featured_act_end_time: featuredActEnd24 || undefined,
        featured_act_link_url: featuredActLinkUrl || undefined,
        featured_act_link_text: featuredActLinkText || undefined,
        custom_link_url: customLinkUrl || undefined,
        custom_link_prompt: customLinkPrompt || undefined,
        custom_link_text: customLinkText || undefined,
      };
      
      onUpdateAdminSettings(updatedSettings);

      // Update active session if it exists
      if (activeSession) {
        try {
          // Update session with featured act fields and custom link
          await SessionClient.update(activeSession.session_id, {
            start_time: start24,
            end_time: end24,
            changeover_time: changeoverFinal,
            performance_time: performanceFinal,
            featured_act_name: featuredActName || undefined,
            featured_act_start_time: featuredActStart24 || undefined,
            featured_act_end_time: featuredActEnd24 || undefined,
            featured_act_link_url: featuredActLinkUrl || undefined,
            featured_act_link_text: featuredActLinkText || undefined,
            custom_link_url: customLinkUrl || undefined,
            custom_link_prompt: customLinkPrompt || undefined,
            custom_link_text: customLinkText || undefined,
          });

          // Generate time slots
          const result = await SessionClient.generateTimeSlots(activeSession.session_id);
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }

      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    return(
        <>
        {showToast && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className="text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px]"
              style={{ backgroundColor: '#16a34a' }}
            >
              <p className="font-semibold mb-2">Your changes have been saved</p>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
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
        <div className="space-y-4">

        {/* Time Slot Settings */}
        <Card className="bg-gray-800/50 border-amber-400/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Time Slot Settings
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
              <div className="flex flex-col gap-2">
                <Label className="text-white">Performance Time</Label>
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

              <div className="flex flex-col gap-2">
                <Label className="text-white">Changeover Time</Label>
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
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <FeaturedActPanel
          featuredActName={featuredActName} setFeaturedActName={setFeaturedActName}
          featuredActStartHour={featuredActStartHour} setFeaturedActStartHour={setFeaturedActStartHour}
          featuredActStartMinute={featuredActStartMinute} setFeaturedActStartMinute={setFeaturedActStartMinute}
          featuredActStartPeriod={featuredActStartPeriod} setFeaturedActStartPeriod={setFeaturedActStartPeriod}
          featuredActEndHour={featuredActEndHour} setFeaturedActEndHour={setFeaturedActEndHour}
          featuredActEndMinute={featuredActEndMinute} setFeaturedActEndMinute={setFeaturedActEndMinute}
          featuredActEndPeriod={featuredActEndPeriod} setFeaturedActEndPeriod={setFeaturedActEndPeriod}
          featuredActLinkUrl={featuredActLinkUrl} setFeaturedActLinkUrl={setFeaturedActLinkUrl}
          featuredActLinkText={featuredActLinkText} setFeaturedActLinkText={setFeaturedActLinkText}
          onSave={handleGenerateSlots}
        />

        <CustomLinkPanel
          customLinkUrl={customLinkUrl} setCustomLinkUrl={setCustomLinkUrl}
          customLinkPrompt={customLinkPrompt} setCustomLinkPrompt={setCustomLinkPrompt}
          customLinkText={customLinkText} setCustomLinkText={setCustomLinkText}
          onSave={handleGenerateSlots}
        />

        </div>
        </>
    )
}