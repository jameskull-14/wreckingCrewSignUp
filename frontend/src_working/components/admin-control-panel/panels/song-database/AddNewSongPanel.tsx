import React from "react";
import { Input } from "../../../shared/Input";
import { Button } from "../../../shared/Button";
import { Plus } from "lucide-react";

export default function AddNewASongPanel(){
    return(
        <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Add New Song to Database</h3>
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
                  }}
                  className="bg-gray-800/50 border-amber-400/30 text-white"
                />
                <Input
                  placeholder="Artist name"
                  value={newSong.artist}
                  onChange={(e) => {
                    setNewSong({...newSong, artist: e.target.value});
                    setSongError('');
                  }}
                  className="bg-gray-800/50 border-amber-400/30 text-white"
                />
                <Input
                  placeholder="Genre (optional)"
                  value={newSong.genre}
                  onChange={(e) => {
                    setNewSong({...newSong, genre: e.target.value});
                    setSongError('');
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