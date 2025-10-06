
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Music, User, Plus, XCircle, X, Guitar } from "lucide-react";
import { motion } from "framer-motion";

export default function TimeSlotGrid({ timeSlots, songs, onSlotClick, onAddSongClick, currentUser, onClearSlot, isAdminMode, activeSession, onRemoveSong }) {
  const getSongInfo = (songId) => {
    return songs.find(s => s.id === songId);
  };

  const songLimit = activeSession?.performer_song_limit || 1;

  return (
    <div className="space-y-3">
      {timeSlots.map((slot, index) => {
        const isEmpty = !slot.is_taken;
        const canSignUp = isEmpty; // Anyone can sign up if the slot is empty
        const canClear = isAdminMode && !isEmpty;
        
        return (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
              isEmpty 
                ? 'border-amber-200/30 hover:border-amber-400/60 bg-gradient-to-r from-gray-900/40 to-gray-800/40 hover:from-gray-800/60 hover:to-gray-700/60' 
                : 'border-amber-400/80 bg-gradient-to-r from-amber-900/20 to-orange-900/20'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-60" />
              
              <div className="p-4 space-y-4">
                {/* Time Row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white tracking-wide">
                      {slot.time}
                    </div>
                    <div className="text-amber-200/70 text-sm">
                      15 min slot
                    </div>
                  </div>
                </div>

                {/* User Row */}
                <div className="flex items-start gap-3">
                  {slot.user_name ? (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-gray-900 font-bold text-lg">
                        {slot.user_name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-white">
                          {slot.user_name}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className="bg-amber-400/30 text-amber-100 border-amber-400/50 px-3 py-1 text-sm font-semibold">
                            <User className="w-4 h-4 mr-1" />
                            Performer
                          </Badge>
                          {(slot.instruments || []).filter(inst => inst !== 'Custom').map(instrument => (
                              <Badge key={instrument} className="bg-purple-500/30 text-purple-100 border-purple-400/50 px-3 py-1 text-sm font-semibold">
                                  {instrument}
                              </Badge>
                          ))}
                          {slot.custom_instrument && (
                              <Badge className="bg-purple-500/30 text-purple-100 border-purple-400/50 px-3 py-1 text-sm font-semibold">
                                  {slot.custom_instrument}
                              </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400 flex-1">
                      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <span className="text-lg">Available</span>
                    </div>
                  )}
                </div>

                {/* Song Rows */}
                {Array.from({ length: songLimit }).map((_, songIndex) => {
                  const songId = slot.song_ids?.[songIndex];
                  const song = songId ? getSongInfo(songId) : null;
                  const canAddSong = isAdminMode && !isEmpty && !song;

                  return (
                    <div className="flex items-center gap-3" key={songIndex}>
                      {song ? (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-semibold text-white truncate">
                              {song.title}
                            </div>
                            <div className="text-amber-200/70 text-sm truncate">
                              by {song.artist}
                            </div>
                          </div>
                          {isAdminMode && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRemoveSong(slot, songIndex)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <div
                          className={`flex items-center gap-3 text-gray-400 flex-1 ${canAddSong ? 'cursor-pointer' : ''}`}
                          onClick={() => canAddSong && onAddSongClick(slot, songIndex)}
                        >
                          <div className={`w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center ${canAddSong ? 'border-amber-400/50 hover:bg-amber-400/10' : 'border-gray-600'}`}>
                            <Music className="w-6 h-6" />
                          </div>
                          <span className="text-lg">Song #{songIndex + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Action Buttons Row */}
                <div className="flex gap-2 justify-center">
                  {canSignUp && (
                    <Button
                      onClick={() => onSlotClick(slot)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-amber-400/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isAdminMode ? 'Admin Sign Up' : 'Sign Up'}
                    </Button>
                  )}
                  {canClear && (
                    <Button
                      onClick={() => onClearSlot(slot)}
                      variant="destructive"
                      className="bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Clear User
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
