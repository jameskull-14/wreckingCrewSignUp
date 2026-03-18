import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { AlertCircle, Check, FileText, RefreshCw, Upload } from "lucide-react";

export default function ImportSongsPanel() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<any>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

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
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/songs/bulk-create', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `Server error: ${response.status}`);
            }

            const result = await response.json();
            setUploadResults(result);
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
                    Import Songs from CSV
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {uploadResults.error ? (
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
                            <div className="p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
                                <div className="flex items-center gap-2 text-green-200 mb-3">
                                    <Check className="w-5 h-5" />
                                    Import Complete
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-3 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-white">{uploadResults.total}</div>
                                        <div className="text-gray-400 text-xs">Rows Found</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-blue-400">{uploadResults.processed}</div>
                                        <div className="text-gray-400 text-xs">Valid Rows</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-green-400">{uploadResults.added}</div>
                                        <div className="text-gray-400 text-xs">Added</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-yellow-400">{uploadResults.duplicates}</div>
                                        <div className="text-gray-400 text-xs">Duplicates</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-400">{uploadResults.skipped}</div>
                                        <div className="text-gray-400 text-xs">Skipped</div>
                                    </div>
                                </div>

                                {uploadResults.added > 0 && uploadResults.songs && (
                                    <div className="mt-3">
                                        <div className="text-green-200 text-sm mb-2">Sample of newly added songs:</div>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {uploadResults.songs.map((song: any, index: number) => (
                                                <div key={index} className="text-xs text-gray-300 bg-gray-900/50 rounded px-2 py-1">
                                                    {song.song_title} by {song.artist}
                                                </div>
                                            ))}
                                            {uploadResults.added > uploadResults.songs.length && (
                                                <div className="text-xs text-gray-400 text-center">
                                                    ... and {uploadResults.added - uploadResults.songs.length} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {uploadResults.skipped > 0 && (
                                    <div className="text-yellow-200 text-sm flex items-center gap-2 mt-3">
                                        <AlertCircle className="w-4 h-4" />
                                        {uploadResults.skipped} rows were skipped (empty data, headers, or errors)
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
