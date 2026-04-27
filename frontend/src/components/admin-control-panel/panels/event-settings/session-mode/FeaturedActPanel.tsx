import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Input } from "../../../../shared/Input";
import { Label } from "../../../../shared/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../shared/Select";
import { Button } from "../../../../shared/Button";

interface FeaturedActPanelProps {
    featuredActName: string;
    setFeaturedActName: (v: string) => void;
    featuredActStartHour: string;
    setFeaturedActStartHour: (v: string) => void;
    featuredActStartMinute: string;
    setFeaturedActStartMinute: (v: string) => void;
    featuredActStartPeriod: 'AM' | 'PM';
    setFeaturedActStartPeriod: (v: 'AM' | 'PM') => void;
    featuredActEndHour: string;
    setFeaturedActEndHour: (v: string) => void;
    featuredActEndMinute: string;
    setFeaturedActEndMinute: (v: string) => void;
    featuredActEndPeriod: 'AM' | 'PM';
    setFeaturedActEndPeriod: (v: 'AM' | 'PM') => void;
    featuredActLinkUrl: string;
    setFeaturedActLinkUrl: (v: string) => void;
    featuredActLinkText: string;
    setFeaturedActLinkText: (v: string) => void;
    onSave: () => void;
}

export default function FeaturedActPanel({
    featuredActName, setFeaturedActName,
    featuredActStartHour, setFeaturedActStartHour,
    featuredActStartMinute, setFeaturedActStartMinute,
    featuredActStartPeriod, setFeaturedActStartPeriod,
    featuredActEndHour, setFeaturedActEndHour,
    featuredActEndMinute, setFeaturedActEndMinute,
    featuredActEndPeriod, setFeaturedActEndPeriod,
    featuredActLinkUrl, setFeaturedActLinkUrl,
    featuredActLinkText, setFeaturedActLinkText,
    onSave
}: FeaturedActPanelProps) {
    return (
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400">
                    Featured Act (Optional)
                </CardTitle>
                {featuredActStartHour && featuredActEndHour && (
                    <p className="text-gray-400 text-sm">This time slot will be locked in place and the other time slots will be generated around it for the session.</p>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label className="text-white">Act Name</Label>
                    <Input
                        type="text"
                        placeholder="e.g., House Band, Special Guest"
                        value={featuredActName}
                        onChange={(e) => setFeaturedActName(e.target.value)}
                        className="bg-gray-900/50 border-amber-400/30 text-white"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-white">Start Time</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                min="1"
                                max="12"
                                placeholder="Hour"
                                value={featuredActStartHour}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) {
                                        setFeaturedActStartHour(val);
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
                                value={featuredActStartMinute}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) {
                                        setFeaturedActStartMinute(val);
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                            />
                            <Select
                                value={featuredActStartPeriod}
                                onValueChange={(value) => setFeaturedActStartPeriod(value as 'AM' | 'PM')}
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
                                value={featuredActEndHour}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || (val.length <= 2 && parseInt(val) >= 0)) {
                                        setFeaturedActEndHour(val);
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
                                value={featuredActEndMinute}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || (val.length <= 2 && parseInt(val) <= 59)) {
                                        setFeaturedActEndMinute(val);
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                className="bg-gray-900/50 border-amber-400/30 text-white w-20 text-sm"
                            />
                            <Select
                                value={featuredActEndPeriod}
                                onValueChange={(value) => setFeaturedActEndPeriod(value as 'AM' | 'PM')}
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
                    <div>
                        <Label className="text-white">Link URL</Label>
                        <Input
                            type="url"
                            placeholder="e.g., https://facebook.com/artist"
                            value={featuredActLinkUrl}
                            onChange={(e) => setFeaturedActLinkUrl(e.target.value)}
                            className="bg-gray-900/50 border-amber-400/30 text-white"
                        />
                    </div>
                    <div>
                        <Label className="text-white">Link Text</Label>
                        <Input
                            type="text"
                            placeholder="e.g., Visit Artist Page"
                            value={featuredActLinkText}
                            onChange={(e) => setFeaturedActLinkText(e.target.value)}
                            className="bg-gray-900/50 border-amber-400/30 text-white"
                        />
                    </div>
                </div>
                <Button
                    onClick={onSave}
                    className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                >
                    Save Changes
                </Button>
            </CardContent>
        </Card>
    );
}
