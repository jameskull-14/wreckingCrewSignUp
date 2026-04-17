import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { AlertCircle, Check, FileText, RefreshCw, Upload } from "lucide-react";
import { AdminUser } from "../../../../types/apiTypes/adminUser";
import { Input } from "../../../shared/Input";
import { SongListClient } from "../../../../api/frontendClient";

interface ImportSongsPanelProps {
    adminInfo: AdminUser;
    onSongsUploaded?: () => void;
}

export default function ImportSongsPanel({ adminInfo, onSongsUploaded }: ImportSongsPanelProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<any>(null);
    const [listName, setListName] = useState("");

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Set default list name from filename if not provided
        const defaultListName = listName.trim() || file.name.replace(/\.csv$/i, '');

        // Validate list name
        if (!defaultListName) {
            setUploadResults({
                error: 'Please enter a name for this song list.'
            });
            return;
        }

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setUploadResults({
                error: 'Invalid file type. Please upload a CSV file.',
                debugInfo: `File type: ${file.type}`
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadResults({
                error: 'File is too large. Maximum size is 5MB.',
                debugInfo: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
            });
            return;
        }

        setIsUploading(true);
        setUploadResults(null);

        try {
            const result = await SongListClient.uploadCSV(
                file,
                adminInfo.admin_user_id,
                defaultListName
            );

            // Format results for display
            const formattedResults = {
                total: result.total,
                processed: result.processed,
                added: result.added,
                list_id: result.list_id,
                errors: result.errors
            };

            setUploadResults(formattedResults);

            // Show warning if there were errors
            if (result.errors && result.errors.length > 0) {
                formattedResults.errors = `${result.errors.length} song(s) could not be processed. See details below.`;
            }

            setUploadResults(formattedResults);

            // Trigger refresh of allowed songs list
            onSongsUploaded?.();
        } catch (error: any) {
            setUploadResults({
                error: error.message || 'An unexpected error occurred',
                debugInfo: error.stack
            });
        } finally {
            setIsUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <Card className="bg-gray-800/50 border-amber-400/20" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Add Songs To Session (Upload)
                </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
            <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-semibold">
                        Custom List Name (optional)
                    </label>
                    <Input
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="Defaults to CSV filename"
                        className="bg-gray-900/50 border-amber-400/30 text-white"
                        disabled={isUploading}
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                        Upload a CSV file with exactly 2 columns:
                    </p>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 text-amber-200 mb-1">
                            <FileText className="w-4 h-4" />
                            Required Format:
                        </div>
                        <div className="text-gray-300 ml-6">
                            <div>Column 1: Song Title</div>
                            <div>Column 2: Artist Name</div>
                        </div>
                        <div className="text-gray-400 text-xs mt-2">
                            • Maximum file size: 5MB
                            • Invalid or empty rows will be skipped
                            • Duplicate songs will be ignored
                            • The import will continue even if some rows have errors
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="song-import-upload"
                    />
                    <label
                        htmlFor="song-import-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer font-semibold transition-all ${
                            isUploading
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white'
                        }`}
                    >
                        {isUploading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing CSV...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Choose CSV File
                            </>
                        )}
                    </label>
                </div>

                {uploadResults && (
                    <div className="space-y-3">
                        {uploadResults.error && !uploadResults.list_id ? (
                            <div className="p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
                                <div className="flex items-center gap-2 text-red-200 mb-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Import Failed
                                </div>
                                <p className="text-red-300 text-sm">{uploadResults.error}</p>
                                {uploadResults.debugInfo && (
                                    <details className="mt-2">
                                        <summary className="text-red-200 text-xs cursor-pointer">Technical Details</summary>
                                        <p className="text-red-300 text-xs mt-1 font-mono">{uploadResults.debugInfo}</p>
                                    </details>
                                )}
                            </div>
                        ) : (
                            <div className={`p-4 border rounded-lg ${uploadResults.errors && uploadResults.errors.length > 0 ? 'bg-yellow-900/20 border-yellow-400/30' : 'bg-green-900/20 border-green-400/30'}`}>
                                <div className={`flex items-center gap-2 mb-3 ${uploadResults.errors && uploadResults.errors.length > 0 ? 'text-yellow-200' : 'text-green-200'}`}>
                                    <Check className="w-5 h-5" />
                                    {uploadResults.errors && uploadResults.errors.length > 0 ? 'Import Completed With Warnings' : 'Import Complete'}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-white">{uploadResults.total}</div>
                                        <div className="text-gray-400 text-xs">Total Rows</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-green-400">{uploadResults.added}</div>
                                        <div className="text-gray-400 text-xs">Songs Added</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-red-400">{uploadResults.errors?.length || 0}</div>
                                        <div className="text-gray-400 text-xs">Errors</div>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-300 mb-2">
                                    <strong>Song List ID:</strong> {uploadResults.list_id}
                                </div>

                                {uploadResults.errors && uploadResults.errors.length > 0 && (
                                    <div className="mt-3">
                                        <div className="text-yellow-200 text-sm mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {uploadResults.errors.length} song(s) could not be processed:
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {uploadResults.errors.map((error: any, index: number) => (
                                                <div key={index} className="text-xs text-red-300 bg-red-900/30 rounded px-2 py-1">
                                                    <strong>Row {error.row}:</strong> {error.title} by {error.artist} - {error.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
