import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/Card";
import { AlertCircle, Check, FileText, RefreshCw, Upload } from "lucide-react";
import React from "react";

export default function SongImportPanel({ onImportComplete, allSongs, setSongError }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
  
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadResults({
          error: 'File is too large. Please use a file smaller than 5MB.',
          success: false
        });
        event.target.value = '';
        return;
      }
  
      // Validate file type
      const validTypes = ['.csv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!validTypes.includes(fileExtension)) {
        setUploadResults({
          error: 'Please upload a CSV file (.csv only)',
          success: false
        });
        event.target.value = '';
        return;
      }
  
      setIsUploading(true);
      setUploadResults(null);
      setSongError('');
  
      try {
        // Upload file
        const { file_url } = await UploadFile({ file });
        
        // Use a very simple schema for CSV extraction
        const extractResult = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              rows: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    col1: { type: "string" },
                    col2: { type: "string" }
                  }
                }
              }
            }
          }
        });
  
        console.log('Extract result:', extractResult);
  
        let songsToProcess = [];
        
        if (extractResult.status === 'success' && extractResult.output) {
          // Try multiple ways to extract the data
          if (extractResult.output.rows) {
            songsToProcess = extractResult.output.rows;
          } else if (Array.isArray(extractResult.output)) {
            songsToProcess = extractResult.output;
          } else {
            // Look for any array in the output
            const keys = Object.keys(extractResult.output);
            for (const key of keys) {
              if (Array.isArray(extractResult.output[key])) {
                songsToProcess = extractResult.output[key];
                break;
              }
            }
          }
        }
  
        console.log('Songs to process:', songsToProcess);
  
        const newSongsToAdd = [];
        let duplicatesCount = 0;
        let skippedCount = 0;
        let processedCount = 0;
  
        // Process each row individually (error-tolerant)
        for (const row of songsToProcess) {
          try {
            let title = '';
            let artist = '';
  
            // Extract title and artist from different possible structures
            if (row.col1 && row.col2) {
              title = row.col1.toString().trim();
              artist = row.col2.toString().trim();
            } else if (Array.isArray(row)) {
              title = (row[0] || '').toString().trim();
              artist = (row[1] || '').toString().trim();
            } else if (typeof row === 'object') {
              const values = Object.values(row);
              title = (values[0] || '').toString().trim();
              artist = (values[1] || '').toString().trim();
            }
  
            // Skip if either title or artist is empty, or looks like a header
            if (!title || !artist || 
                title.toLowerCase().includes('song') || 
                title.toLowerCase().includes('title') ||
                artist.toLowerCase().includes('artist') ||
                artist.toLowerCase().includes('name')) {
              skippedCount++;
              continue;
            }
  
            processedCount++;
  
            // Check for duplicates
            const isDuplicate = allSongs.some(dbSong =>
              dbSong.title.toLowerCase().trim() === title.toLowerCase() &&
              dbSong.artist.toLowerCase().trim() === artist.toLowerCase()
            );
  
            if (!isDuplicate) {
              // Add each song individually to handle errors gracefully
              try {
                await Song.create({
                  title: title,
                  artist: artist,
                  is_available: true
                });
                
                newSongsToAdd.push({ title, artist });
              } catch (createError) {
                console.error('Error adding song:', title, 'by', artist, createError);
                skippedCount++;
              }
            } else {
              duplicatesCount++;
            }
          } catch (rowError) {
            console.error('Error processing row:', row, rowError);
            skippedCount++;
          }
        }
  
        setUploadResults({
          total: songsToProcess.length,
          processed: processedCount,
          added: newSongsToAdd.length,
          duplicates: duplicatesCount,
          skipped: skippedCount,
          songs: newSongsToAdd.slice(0, 10),
          success: true
        });
  
        // Call the completion callback to refresh the song list
        if (onImportComplete) {
          onImportComplete();
        }
  
      } catch (error) {
        console.error('Upload error:', error);
        
        let errorMessage = 'Failed to process file. ';
        if (error.message.includes('timeout') || error.message.includes('DatabaseTimeout')) {
          errorMessage += 'The upload timed out. Please try again with a smaller file.';
        } else if (error.message.includes('500')) {
          errorMessage += 'Server error occurred. Please try again in a few moments.';
        } else {
          errorMessage += 'Please ensure your CSV file has exactly 2 columns: Song Title and Artist Name.';
        }
  
        setUploadResults({
          error: errorMessage,
          success: false,
          debugInfo: error.message
        });
      }
      
      setIsUploading(false);
      event.target.value = '';
    };
  
    return (
      <Card className="bg-gray-800/50 border-amber-400/20">
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
              <Upload className="w-4 h-4" />
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing CSV...
                </>
              ) : (
                'Choose CSV File'
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
                        {uploadResults.songs.map((song, index) => (
                          <div key={index} className="text-xs text-gray-300 bg-gray-900/50 rounded px-2 py-1">
                            {song.title} by {song.artist}
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