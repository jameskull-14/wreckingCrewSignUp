import { useState } from "react";
import { SettingsPanelBaseProps } from "../../../../../types/componentTypes/navigationContentProps";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Timer } from "lucide-react";
import { Label } from "../../../../shared/Label";
import { Input } from "../../../../shared/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";
import FeaturedActPanel from "./FeaturedActPanel";
import CustomLinkPanel from "./CustomLinkPanel";

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
}: SettingsPanelBaseProps){

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

    const [featuredActName, setFeaturedActName] = useState(adminSettings?.featured_act_name || '');
    const [featuredActStartHour, setFeaturedActStartHour] = useState(() =>
        adminSettings?.featured_act_start_time ? convertFrom24Hour(adminSettings.featured_act_start_time).hour.toString() : ''
    );
    const [featuredActStartMinute, setFeaturedActStartMinute] = useState(() =>
        adminSettings?.featured_act_start_time ? convertFrom24Hour(adminSettings.featured_act_start_time).minute.toString().padStart(2, '0') : ''
    );
    const [featuredActStartPeriod, setFeaturedActStartPeriod] = useState<'AM' | 'PM'>(() =>
        adminSettings?.featured_act_start_time ? convertFrom24Hour(adminSettings.featured_act_start_time).period : 'PM'
    );
    const [featuredActEndHour, setFeaturedActEndHour] = useState(() =>
        adminSettings?.featured_act_end_time ? convertFrom24Hour(adminSettings.featured_act_end_time).hour.toString() : ''
    );
    const [featuredActEndMinute, setFeaturedActEndMinute] = useState(() =>
        adminSettings?.featured_act_end_time ? convertFrom24Hour(adminSettings.featured_act_end_time).minute.toString().padStart(2, '0') : ''
    );
    const [featuredActEndPeriod, setFeaturedActEndPeriod] = useState<'AM' | 'PM'>(() =>
        adminSettings?.featured_act_end_time ? convertFrom24Hour(adminSettings.featured_act_end_time).period : 'PM'
    );
    const [featuredActLinkUrl, setFeaturedActLinkUrl] = useState(adminSettings?.featured_act_link_url || '');
    const [featuredActLinkText, setFeaturedActLinkText] = useState(adminSettings?.featured_act_link_text || '');

    const [customLinkUrl, setCustomLinkUrl] = useState(adminSettings?.custom_link_url || '');
    const [customLinkPrompt, setCustomLinkPrompt] = useState(adminSettings?.custom_link_prompt || '');
    const [customLinkText, setCustomLinkText] = useState(adminSettings?.custom_link_text || '');

    const [showToast, setShowToast] = useState(false);

    const handleSave = () => {
        const start24 = convertTo24Hour(
            Math.max(1, Math.min(12, parseInt(startHour) || 1)),
            Math.max(0, Math.min(59, parseInt(startMinute) || 0)),
            startPeriod
        );
        const end24 = convertTo24Hour(
            Math.max(1, Math.min(12, parseInt(endHour) || 1)),
            Math.max(0, Math.min(59, parseInt(endMinute) || 0)),
            endPeriod
        );

        let featuredActStart24: string | undefined;
        let featuredActEnd24: string | undefined;
        if (featuredActStartHour && featuredActStartMinute) {
            featuredActStart24 = convertTo24Hour(
                Math.max(1, Math.min(12, parseInt(featuredActStartHour) || 1)),
                Math.max(0, Math.min(59, parseInt(featuredActStartMinute) || 0)),
                featuredActStartPeriod
            );
        }
        if (featuredActEndHour && featuredActEndMinute) {
            featuredActEnd24 = convertTo24Hour(
                Math.max(1, Math.min(12, parseInt(featuredActEndHour) || 1)),
                Math.max(0, Math.min(59, parseInt(featuredActEndMinute) || 0)),
                featuredActEndPeriod
            );
        }

        onUpdateAdminSettings({
            ...adminSettings,
            start_time: start24,
            end_time: end24,
            featured_act_name: featuredActName || undefined,
            featured_act_start_time: featuredActStart24,
            featured_act_end_time: featuredActEnd24,
            featured_act_link_url: featuredActLinkUrl || undefined,
            featured_act_link_text: featuredActLinkText || undefined,
            custom_link_url: customLinkUrl || undefined,
            custom_link_prompt: customLinkPrompt || undefined,
            custom_link_text: customLinkText || undefined,
        });

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
                  style={{ width: '100%', backgroundColor: '#ffffff', animation: 'shrink 3s linear forwards' }}
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
        <Card className="bg-gray-800/50 border-amber-400/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Order Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Start Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" min="1" max="12" placeholder="Hour"
                    value={startHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) setStartHour(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
                  <span className="text-white">:</span>
                  <Input
                    type="number" min="0" max="59" placeholder="Min"
                    value={startMinute}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) setStartMinute(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
                  <Select value={startPeriod} onValueChange={(v) => setStartPeriod(v as 'AM' | 'PM')}>
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
                    type="number" min="1" max="12" placeholder="Hour"
                    value={endHour}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) setEndHour(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
                  <span className="text-white">:</span>
                  <Input
                    type="number" min="0" max="59" placeholder="Min"
                    value={endMinute}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) setEndMinute(val);
                    }}
                    onFocus={(e) => e.target.select()}
                    className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                  />
                  <Select value={endPeriod} onValueChange={(v) => setEndPeriod(v as 'AM' | 'PM')}>
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
            <Button
              onClick={handleSave}
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
          onSave={handleSave}
        />

        <CustomLinkPanel
          customLinkUrl={customLinkUrl} setCustomLinkUrl={setCustomLinkUrl}
          customLinkPrompt={customLinkPrompt} setCustomLinkPrompt={setCustomLinkPrompt}
          customLinkText={customLinkText} setCustomLinkText={setCustomLinkText}
          onSave={handleSave}
        />
        </div>
        </>
    );
}
