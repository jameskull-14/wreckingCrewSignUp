import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/Card";
import { Input } from "../../../../shared/Input";
import { Label } from "../../../../shared/Label";
import { Button } from "../../../../shared/Button";

interface CustomLinkPanelProps {
    customLinkUrl: string;
    setCustomLinkUrl: (v: string) => void;
    customLinkPrompt: string;
    setCustomLinkPrompt: (v: string) => void;
    customLinkText: string;
    setCustomLinkText: (v: string) => void;
    onSave: () => void;
}

export default function CustomLinkPanel({
    customLinkUrl, setCustomLinkUrl,
    customLinkPrompt, setCustomLinkPrompt,
    customLinkText, setCustomLinkText,
    onSave
}: CustomLinkPanelProps) {
    return (
        <Card className="bg-gray-800/50 border-amber-400/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400">
                    Custom Link (Optional)
                </CardTitle>
                <p className="text-gray-400 text-sm">Link will show at the top of the session for all to see.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label className="text-white">Link URL</Label>
                    <Input
                        type="url"
                        placeholder="e.g., https://facebook.com/event"
                        value={customLinkUrl}
                        onChange={(e) => setCustomLinkUrl(e.target.value)}
                        className="bg-gray-900/50 border-amber-400/30 text-white"
                    />
                </div>
                <div>
                    <Label className="text-white">Prompt Text</Label>
                    <Input
                        type="text"
                        placeholder="e.g., Post your pictures here"
                        value={customLinkPrompt}
                        onChange={(e) => setCustomLinkPrompt(e.target.value)}
                        className="bg-gray-900/50 border-amber-400/30 text-white"
                    />
                </div>
                <div>
                    <Label className="text-white">Link Display Text</Label>
                    <Input
                        type="text"
                        placeholder="e.g., Click Here"
                        value={customLinkText}
                        onChange={(e) => setCustomLinkText(e.target.value)}
                        className="bg-gray-900/50 border-amber-400/30 text-white"
                    />
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
