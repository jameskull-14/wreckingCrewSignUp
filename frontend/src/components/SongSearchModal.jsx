import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Music, User, Clock, CheckCircle, Shield, AlertCircle, PlusCircle, XCircle, Guitar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SongSearchModal({
  isOpen,
  onClose,
  songs,
  slotInfo,
  onConfirm,
  currentUser,
  isAdminMode,
  activeSession,
  timeSlots,
  queueEntries = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [userName, setUserName] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [customInstrument, setCustomInstrument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { slot, mode } = slotInfo || { slot: null, mode: 'signup' };
  const isAddingMode = mode === 'add';
  const isOrderMode = mode === 'queue';
  const isSignupMode = mode === 'signup';
  
  const effectiveSongLimit = isAddingMode ? 1 : (activeSession?.performer_song_limit || 1);

  const instrumentOptions = ['Drums', 'Guitars', 'Bass', 'Vocals', 'Custom'];

  // Debug: Log the songs to see what's being passed
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened with songs:', songs?.length || 0);
      console.log('Available songs:', songs);
    }
  }, [isOpen, songs]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSongs([]);
      setUserName('');
      setSearchTerm('');
      setSelectedInstruments([]);
      setCustomInstrument('');
      setIsSubmitting(false);
      setErrorMessage('');
    } else {
      if (isAddingMode && slot) {
        setUserName(slot.user_name || 'User');
      } else {
        setUserName(currentUser?.full_name || '');
      }
    }
  }, [isOpen, currentUser, isAddingMode, slot]);

  // Calculate current user's signups
  const userSignups = (userName.trim() && !isAdminMode && !isAddingMode) ? 
    (isOrderMode 
      ? queueEntries.filter(e => e.user_name.toLowerCase() === userName.trim().toLowerCase() && e.status !== 'completed').length
      : timeSlots.filter(s => s.is_taken && s.user_name.toLowerCase() === userName.trim().toLowerCase()).length)
    : 0;
  
  const hasReachedPerformerLimit = userSignups >= 1 && effectiveSongLimit === 1 && !isAddingMode;

  // Get songs that are already used in the session
  const usedSongIds = isOrderMode
    ? queueEntries.flatMap(entry => entry.song_ids || [])
    : timeSlots.filter(s => s.id !== slot?.id).flatMap(s => s.song_ids || []);

  console.log('Allow song reuse');
activeSession?.allow_song_reuse;
  console.log('Used song IDs:', usedSongIds);
  console.log('Current slot ID:', slot?.id);


  // Simplified filtering - just search, no complex availability logic
  const filteredSongs = (songs || []).filter(song => {
    if (!song || !song.title) return false;

    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(searchLower) ||
      (song.artist && song.artist.toLowerCase().includes(searchLower)) ||
      (song.genre && song.genre.toLowerCase().includes(searchLower))
    );
  });

  const canSelectSong = (song) => {
    if (isAdminMode) return true;
    if (activeSession?.allow_song_reuse) return true;
    return !usedSongIds.includes(song.id);
  };
  
  const handleSongSelect = (song) => {
    const isAlreadySelected = selectedSongs.some(s => s.id === song.id);

    if (isAlreadySelected) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } 
    else {
      // check if a song has been selected based off allow_song_reuse
      if(!canSelectSong(song)){
        setErrorMessage('This song has already been selected by another performer');
        setTimeout(()=>setErrorMessage(''), 3000);
        return;
      }
      if (selectedSongs.length < effectiveSongLimit) {
        setSelectedSongs([...selectedSongs, song]);
      } else {
        setErrorMessage(`You can select a maximum of ${effectiveSongLimit} song(s).`);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleInstrumentToggle = (instrument) => {
    if (selectedInstruments.includes(instrument)) {
      setSelectedInstruments(selectedInstruments.filter(i => i !== instrument));
    } else {
      setSelectedInstruments([...selectedInstruments, instrument]);
    }
  };

  const handleConfirm = async () => {
    if (hasReachedPerformerLimit && !isAdminMode) {
      setErrorMessage(`You have already signed up for a performance.`);
      return;
    }
    if (selectedSongs.length > 0 && (userName.trim() || isAddingMode)) {
      setIsSubmitting(true);
      setErrorMessage('');
      try {
        const instrumentData = {
          instruments: selectedInstruments,
          custom_instrument: selectedInstruments.includes('Custom') ? customInstrument : '',
          singing_along: false
        };

        if (isAddingMode) {
          await onConfirm(selectedSongs);
        } else if (isOrderMode) {
          await onConfirm(userName.trim(), selectedSongs, instrumentData);
        } else {
          await onConfirm(slot, userName.trim(), selectedSongs, instrumentData);
        }
        onClose();
      } catch (error) {
        console.error('Error submitting signup:', error);
        setErrorMessage('An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canSubmit = selectedSongs.length > 0 && (userName.trim() || isAddingMode);
  
  const getDialogTitle = () => {
    if (isAddingMode) return `Add Song for ${slot?.user_name}`;
    if (isOrderMode) return 'Join Performance Queue';
    return `Sign Up for ${slot?.time}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30 text-white flex flex-col p-0">
        <DialogHeader className="border-b border-amber-400/20 px-6 pt-6 pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-900" />
            </div>
            {isAdminMode && !isAddingMode ? 'Admin: ' : ''}{getDialogTitle()}
            <Badge className="bg-blue-400/20 text-blue-200 border-blue-400/30 ml-2">
              Select up to {effectiveSongLimit} song(s)
            </Badge>
            {isAdminMode && (
              <Badge className="bg-purple-400/20 text-purple-200 border-purple-400/30 ml-2">
                <Shield className="w-3 h-3 mr-1" />
                Admin Mode
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto px-6 py-6 pb-20 sm:pb-6">
          {/* Left: User Info & Song Search */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* User Name Input */}
            {!isAddingMode && (
              <div className="space-y-2">
                <label className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Your Name
                </label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-gray-800/50 border-amber-400/30 text-white placeholder:text-gray-400 text-lg p-4"
                  disabled={isSubmitting}
                />
                {!isAdminMode && effectiveSongLimit === 1 && (
                  <p className="text-sm text-gray-400 pl-1">
                    You have {userSignups}/{effectiveSongLimit} performance slots used.
                  </p>
                )}
              </div>
            )}

            {/* Instrument Selection */}
            {!isAddingMode && (
              <div className="space-y-4">
                <label className="text-lg font-semibold flex items-center gap-2">
                  <Guitar className="w-5 h-5 text-amber-400" />
                  Instruments
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {instrumentOptions.map(instrument => (
                    <div 
                      key={instrument}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedInstruments.includes(instrument)
                          ? 'border-amber-400 bg-amber-400/20'
                          : 'border-gray-600 bg-gray-800/40 hover:border-amber-400/60'
                      }`}
                      onClick={() => handleInstrumentToggle(instrument)}
                    >
                      <div className="text-center font-semibold text-white">{instrument}</div>
                    </div>
                  ))}
                </div>

                {selectedInstruments.includes('Custom') && (
                  <div>
                    <Label className="text-white text-sm">Custom Instrument</Label>
                    <Input
                      value={customInstrument}
                      onChange={(e) => setCustomInstrument(e.target.value)}
                      placeholder="Enter your instrument..."
                      className="bg-gray-800/50 border-amber-400/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Song Search */}
            <div className="space-y-4 flex-1 flex flex-col">
              <label className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                Choose Your Song(s)
                <span className="text-sm text-gray-400">({(songs || []).length} songs available)</span>
              </label>

              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search songs, artists, or genres..."
                  className="bg-gray-800/50 border-amber-400/30 text-white placeholder:text-gray-400 text-lg p-4 pl-12"
                  disabled={isSubmitting || (hasReachedPerformerLimit && !isAdminMode)}
                />
              </div>

              {/* Song List */}
              <div className="flex-1 max-h-96 overflow-y-auto space-y-2 border border-amber-400/20 rounded-lg p-4 bg-gray-800/20">
                <AnimatePresence>
                  {filteredSongs.map((song) => {
                    const isUsed = usedSongIds.includes(song.id);
                    const canSelect = canSelectSong(song);
                    const isSelected = selectedSongs.some(s => s.id === song.id);

                    return (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-lg transition-all duration-200 border-2 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/20'
                            : (canSelect && !(hasReachedPerformerLimit && !isAdminMode))
                              ? 'border-gray-600/50 hover:border-amber-400/60 bg-gray-800/40 hover:bg-gray-700/60 cursor-pointer'
                              : 'border-gray-700/30 bg-gray-900/60 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && !(hasReachedPerformerLimit && !isAdminMode) && !isSubmitting && handleSongSelect(song)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                : (canSelect && !(hasReachedPerformerLimit && !isAdminMode))
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                  : 'bg-gray-600/50'
                            }`}>
                              {isSelected ? (
                                <CheckCircle className="w-6 h-6 text-gray-900" />
                              ) : (
                                <Music className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold ${(canSelect && !(hasReachedPerformerLimit && !isAdminMode)) ? 'text-white' : 'text-gray-500'}`}>
                                {song.title}
                              </div>
                              <div className={`${(canSelect && !(hasReachedPerformerLimit && !isAdminMode)) ? 'text-amber-200/70' : 'text-gray-600'} text-sm`}>
                                by {song.artist}
                              </div>
                              {(!canSelect || (hasReachedPerformerLimit && !isAdminMode)) && !isAdminMode && (
                                <div className="text-red-400 text-sm font-medium mt-1">
                                  {hasReachedPerformerLimit ? 'Slot limit reached' : 'Song Already Chosen'}
                                </div>
                              )}
                            </div>
                          </div>
                          {song.genre && (
                            <Badge className="bg-purple-400/20 text-purple-200 border-purple-400/30">
                              {song.genre}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredSongs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    {(songs || []).length === 0 ? (
                      <>
                        <p className="text-lg">No songs available</p>
                        <p className="text-sm">Contact admin to add songs</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg">No songs found</p>
                        <p className="text-sm">Try a different search term</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Selected Songs & Summary */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                Your Selection ({selectedSongs.length}/{effectiveSongLimit})
              </h3>
              <div className="min-h-[150px] space-y-2 rounded-lg border-2 border-dashed border-amber-400/20 p-4 bg-gray-800/20">
                {selectedSongs.length > 0 ? (
                  <AnimatePresence>
                    {selectedSongs.map(song => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Music className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="font-semibold text-white">{song.title}</div>
                            <div className="text-sm text-gray-400">by {song.artist}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSongSelect(song)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <PlusCircle className="w-8 h-8 mb-2" />
                    <p>Select songs from the list</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instrument Summary */}
            {!isAddingMode && selectedInstruments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-md font-semibold text-amber-400">Instruments</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInstruments.map(instrument => (
                    <Badge key={instrument} className="bg-purple-400/20 text-purple-200 border-purple-400/30">
                      {instrument === 'Custom' ? customInstrument || 'Custom' : instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-red-400/30 bg-red-900/20 text-red-300 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Selected Summary */}
            {canSubmit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg border border-green-400/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">Ready to Sign Up!</div>
                    <div className="text-green-200/80">
                      <strong>{userName}</strong> • {selectedSongs.length} song(s) • {isOrderMode ? 'Performance Queue' : slot?.time}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 to-gray-800 border-t border-amber-400/20 p-4 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:pt-4 sm:px-6 sm:pb-6">
          <div className="flex justify-between items-center gap-4 max-w-5xl mx-auto">
            <div className="flex-1">
              {!canSubmit && !errorMessage && !isAddingMode && (
                <div className="text-amber-400/70 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  {!userName.trim() && selectedSongs.length === 0 && "Enter your name and select song(s)"}
                  {!userName.trim() && selectedSongs.length > 0 && "Please enter your name"}
                  {userName.trim() && selectedSongs.length === 0 && "Please select at least one song"}
                </div>
              )}
              {canSubmit && !errorMessage && (
                <div className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Ready to submit your signup!
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!canSubmit || isSubmitting || (hasReachedPerformerLimit && !isAdminMode)}
                className={`font-semibold transition-all duration-200 ${
                  (canSubmit && !(hasReachedPerformerLimit && !isAdminMode))
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Sign-Up
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}