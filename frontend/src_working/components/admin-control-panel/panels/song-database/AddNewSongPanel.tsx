import { useState } from 'react';
import { Input } from "../../../shared/Input";
import { Button } from "../../../shared/Button";
import { Plus } from "lucide-react";
import { Song } from '../../../../api/frontendClient';

export default function AddNewASongPanel(){
  const [newSong, setNewSong] = useState({ title: '', artist: '', genre: '' });
  const [songError, setSongError] = useState('');
  const [songSuccess, setSongSuccess] = useState('');


  const handleAddSong = async () => {
    if (newSong.title.trim() && newSong.artist.trim()) {
      try {
        await Song.create(newSong);

        // Success - clear form and show success message
        setSongSuccess('Song successfully added!');
        setNewSong({ title: '', artist: '', genre: '' });
        setSongError('');

        // Clear success message after 3 seconds
        setTimeout(() => setSongSuccess(''), 3000);
      } catch (error: unknown) {
        console.error('Error adding song:', error);

        // Try to extract error message
        if (error && typeof error === 'object') {
          // Check for various error formats
          if ('detail' in error && typeof error.detail === 'string') {
            setSongError(error.detail);
          } else if ('message' in error && typeof error.message === 'string') {
            setSongError(error.message);
          } else if ('body' in error && error.body && typeof error.body === 'object') {
            const body = error.body as any;
            setSongError(body.detail || body.message || 'Error adding song to database');
          } else {
            setSongError('Error adding song to database');
          }
        } else {
          setSongError('Error adding song to database');
        }
      }
    }
  };
 
    return(
        <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Add New Song to Database</h3>
              {songError && (
                <div className="p-3 bg-red-900/20 border border-red-400/30 rounded-lg text-red-200">
                  {songError}
                </div>
              )}
              {songSuccess && (
                <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg text-green-200">
                  {songSuccess}
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
              <Button
                onClick={handleAddSong}
                disabled={!newSong.title.trim() || !newSong.artist.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Database
              </Button>
            </div>
        );
}