import { useState, useEffect } from 'react';
import { Input } from "../../../shared/Input";
import { Button } from "../../../shared/Button";
import { Plus, AlertCircle } from "lucide-react";
import { SongClient, AdminAllowedSongClient, SessionSongClient } from '../../../../api/frontendClient';
import { AdminUser } from '../../../../types/apiTypes/adminUser';
import { Session } from '../../../../types/apiTypes/session';
import SongSearch from '../../../SongSearch';

interface AddNewSongPanelProps {
  adminInfo: AdminUser;
  onSongAdded?: () => void;
  refreshTrigger?: number;
  activeSession?: Session | null;
}

export default function AddNewASongPanel({ adminInfo, onSongAdded, refreshTrigger, activeSession }: AddNewSongPanelProps){
  const [newSong, setNewSong] = useState({ title: '', artist: '', genre: '' });
  const [songError, setSongError] = useState('');
  const [songSuccess, setSongSuccess] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  const handleAddSongToDatabase = async () => {
    if (newSong.title.trim() && newSong.artist.trim()) {
      try {
        console.log('\n=== AddNewSongPanel: Adding song to database ===');
        console.log('  Song data:', newSong);
        console.log('  activeSession:', activeSession);

        // Create the song in the database
        console.log('  → Creating song in song table');
        const createdSong = await SongClient.create(newSong);
        console.log('  ✓ Song created with ID:', createdSong.song_id);

        // Add to the correct table based on activeSession
        if (activeSession) {
          // Add to session_song
          console.log('  → Adding to SESSION_SONG table');
          await SessionSongClient.create({
            session_id: activeSession.session_id,
            song_id: createdSong.song_id
          });
          console.log('  ✓ Added to session_song');
        } else {
          // Add to admin_allowed_song
          console.log('  → Adding to ADMIN_ALLOWED_SONG table');
          await AdminAllowedSongClient.create({
            admin_user_id: adminInfo.admin_user_id,
            song_id: createdSong.song_id
          });
          console.log('  ✓ Added to admin_allowed_song');
        }

        // Success - clear form and show success message
        setSongSuccess(activeSession
          ? 'Song added to database and session!'
          : 'Song added to database and allowed songs!');
        setNewSong({ title: '', artist: '', genre: '' });
        setSongError('');
        setShowManualForm(false);

        // Trigger refresh
        console.log('  Calling onSongAdded callback');
        onSongAdded?.();
        console.log('=== AddNewSongPanel: Complete ===\n');

        // Clear success message after 3 seconds
        setTimeout(() => setSongSuccess(''), 3000);
      } catch (error: unknown) {
        console.error('  ✗ Error adding song:', error);

        // Try to extract error message
        if (error && typeof error === 'object') {
          // Check for various error formats
          if ('detail' in error && typeof error.detail === 'string') {
            setSongError(error.detail);
          } else if ('message' in error && typeof error.message === 'string') {
            setSongError(error.message);
          } else if ('body' in error && error.body && typeof error.body === 'object') {
            const body = error.body as any;
            setSongError(body.detail || body.message || 'Error adding song');
          } else {
            setSongError('Error adding song');
          }
        } else {
          setSongError('Error adding song');
        }
      }
    }
  };

  return(
        <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Add Individual Song To Session</h3>

              {songSuccess && (
                <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-green-200">
                  {songSuccess}
                </div>
              )}

              {/* Song Search Section */}
              <div>
                <SongSearch
                  adminUserId={adminInfo.admin_user_id}
                  mode="toggle"
                  showLabel={false}
                  placeholder={activeSession ? "Search for a song to add to session..." : "Search for a song to add..."}
                  inputClassName="bg-gray-800/50 border-amber-400/30 text-white text-sm"
                  onSongAdded={onSongAdded}
                  refreshTrigger={refreshTrigger}
                  activeSession={activeSession}
                />
              </div>

              {/* Manual Add Form - shown when user wants to add song not in database */}
              {!showManualForm ? (
                <div className="text-center">
                  <Button
                    onClick={() => setShowManualForm(true)}
                    style={{ backgroundColor: '#16a34a' }}
                    className="text-white"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                  >
                    Song Not In Database? Add It Here
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-amber-400/30 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Add Song To Database</span>
                  </div>

                  {songError && (
                    <div className="p-3 bg-red-900/20 border border-red-400/30 rounded-lg text-red-200">
                      {songError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Song title"
                      value={newSong.title}
                      onChange={(e) => {
                        setNewSong({...newSong, title: e.target.value});
                        setSongError('');
                        setSongSuccess('');
                      }}
                      className="bg-gray-800/50 border-amber-400/30 text-white"
                    />
                    <Input
                      placeholder="Artist name"
                      value={newSong.artist}
                      onChange={(e) => {
                        setNewSong({...newSong, artist: e.target.value});
                        setSongError('');
                        setSongSuccess('');
                      }}
                      className="bg-gray-800/50 border-amber-400/30 text-white"
                    />
                    <Input
                      placeholder="Genre (optional)"
                      value={newSong.genre}
                      onChange={(e) => {
                        setNewSong({...newSong, genre: e.target.value});
                        setSongError('');
                        setSongSuccess('');
                      }}
                      className="bg-gray-800/50 border-amber-400/30 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddSongToDatabase}
                      disabled={!newSong.title.trim() || !newSong.artist.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Database & Session
                    </Button>
                    <Button
                      onClick={() => {
                        setShowManualForm(false);
                        setNewSong({ title: '', artist: '', genre: '' });
                        setSongError('');
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
        );
}