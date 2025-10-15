
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings, RotateCcw, Plus, Music, Clock, Users, Save, UserX, Rocket, PowerOff,
  Database, RefreshCw, Upload, QrCode, Check, X, Download
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminTimeSlot, Song, AdminSession, AdminSongSelection, QueueEntry } from '@/api/entities';
import SchedulingSettings from './SchedulingSettings';
import SongImport from './SongImport';

export default function AdminPanel({
  adminUsername,
  allSongs,
  timeSlots,
  activeSession,
  queueEntries,
  onLoadData
}) {
  const [eventTitle, setEventTitle] = useState(activeSession?.title || '');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [newSong, setNewSong] = useState({ title: '', artist: '', genre: '' });
  const [songError, setSongError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const loadSelectedSongs = useCallback(async () => {
    if (!adminUsername) return;

    try {
      const selections = await AdminSongSelection.filter({ admin_username: adminUsername });
      setSelectedSongs(selections);
    } catch (error) {
      console.error('Error loading selected songs:', error);
    }
  }, [adminUsername]);

  useEffect(() => {
    setEventTitle(activeSession?.title || '');
    loadSelectedSongs();
    if (activeSession?.is_active) {
        // Ensure window.location.href is accessible and correctly encoded for the QR code
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.href)}`);
    } else {
        setQrCodeUrl('');
    }
  }, [activeSession, loadSelectedSongs]);

  const handleSaveTitle = async () => {
    if (activeSession && eventTitle.trim()) {
      try {
        await AdminSession.update(activeSession.id, { title: eventTitle });
        onLoadData();
      } catch (error) {
        console.error('Error updating title:', error);
      }
    }
  };

  const handleAddSong = async () => {
    if (newSong.title.trim() && newSong.artist.trim()) {
      try {
        const isDuplicate = allSongs.some(song =>
          song.title.toLowerCase().trim() === newSong.title.toLowerCase().trim() &&
          song.artist.toLowerCase().trim() === newSong.artist.toLowerCase().trim()
        );

        if (isDuplicate) {
          setSongError('This song is already in the database');
          return;
        }

        await Song.create(newSong);
        setNewSong({ title: '', artist: '', genre: '' });
        setSongError('');
        onLoadData();
      } catch (error) {
        console.error('Error adding song:', error);
        setSongError('Error adding song to database');
      }
    }
  };

  const handleLaunchSession = async () => {
    if (!activeSession) return;

    try {
      const allActiveSessions = await AdminSession.filter({ is_active: true });
      for (const session of allActiveSessions) {
        if (session.id !== activeSession.id) {
          await AdminSession.update(session.id, { is_active: false });
        }
      }

      await AdminSession.update(activeSession.id, { is_active: true });
      onLoadData();
    } catch (error) {
      console.error('Error launching session:', error);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await AdminSession.update(activeSession.id, { is_active: false, allow_song_reuse: true });

      // Clear all time slots for this admin
      if (timeSlots.length > 0) {
        const clearPromises = timeSlots.map(slot =>
          AdminTimeSlot.update(slot.id, {
            user_name: null,
            song_id: null,
            song_ids: [],
            is_taken: false,
            instruments: [],
            custom_instrument: null,
            singing_along: false,
          })
        );
        await Promise.all(clearPromises);
      }

      // Clear all queue entries for this admin (for order mode)
      if (queueEntries && queueEntries.length > 0) {
        const queueClearPromises = queueEntries.map(entry => 
          QueueEntry.delete(entry.id)
        );
        await Promise.all(queueClearPromises);
      }

      onLoadData();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleClearSlot = async (slot) => {
    if (!slot || !slot.is_taken) return;
    try {
      await AdminTimeSlot.update(slot.id, {
        user_name: null,
        song_id: null,
        song_ids: [],
        is_taken: false,
        instruments: [],
        custom_instrument: null,
        singing_along: false,
      });
      onLoadData();
    } catch (error) {
      console.error('Error clearing slot:', error);
    }
  };

  const handleClearAllSlots = async () => {
    try {
      const resetPromises = timeSlots.map(slot =>
        AdminTimeSlot.update(slot.id, {
          user_name: null,
          song_id: null,
          song_ids: [],
          is_taken: false,
          instruments: [],
          custom_instrument: null,
          singing_along: false,
        })
      );
      await Promise.all(resetPromises);
      
      // Also clear queue entries if they exist
      if (queueEntries && queueEntries.length > 0) {
        const queueClearPromises = queueEntries.map(entry => 
          QueueEntry.delete(entry.id)
        );
        await Promise.all(queueClearPromises);
      }

      onLoadData();
    } catch (error) {
      console.error('Error clearing all slots:', error);
    }
  };

  // Generic update function for activeSession properties
  const handleUpdateSession = async (updates) => {
    if (!activeSession) return;
    try {
      await AdminSession.update(activeSession.id, updates);
      onLoadData();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleToggleUseAllSongs = async () => {
    if (!activeSession) return;
    handleUpdateSession({ use_all_songs: !activeSession.use_all_songs });
  };

  const handleToggleAllowReuse = async () => {
    if (!activeSession) return;
    handleUpdateSession({ allow_song_reuse: !activeSession.allow_song_reuse });
  };

  const handleAddSongToSelection = async (song) => {
    try {
      await AdminSongSelection.create({
        admin_username: adminUsername,
        song_id: song.id,
        is_available: true
      });
      loadSelectedSongs();
      onLoadData();
    } catch (error) {
      console.error('Error adding song to selection:', error);
    }
  };

  const handleRemoveSongFromSelection = async (selection) => {
    try {
      await AdminSongSelection.delete(selection.id);
      loadSelectedSongs();
      onLoadData();
    } catch (error) {
      console.error('Error removing song from selection:', error);
    }
  };

  const handleGenerateSlots = async () => {
    if (!activeSession) return;
    
    try {
      // Clear existing time slots
      const clearPromises = timeSlots.map(slot => 
        AdminTimeSlot.delete(slot.id)
      );
      await Promise.all(clearPromises);

      // Generate new slots based on settings
      const startTime = activeSession.start_time || '19:00';
      const endTime = activeSession.end_time || '23:00';
      const increment = activeSession.time_increment || 15; // in minutes
      const changeover = activeSession.changeover_time || 0; // in minutes
      
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      const totalSlotTime = increment + changeover; // Total time between slot starts
      const slots = [];
      const usedTimes = new Set(); // Track used times to ensure uniqueness
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += totalSlotTime) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const timeStr = `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
        
        // Ensure uniqueness
        if (!usedTimes.has(timeStr)) {
          usedTimes.add(timeStr);
          slots.push({
            admin_username: adminUsername,
            time: timeStr
          });
        }
      }
      
      if (slots.length > 0) {
        await AdminTimeSlot.bulkCreate(slots);
      }
      
      onLoadData();
    } catch (error) {
      console.error('Error generating slots:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      // Combine time slots and queue entries data
      const allPerformances = [
        ...timeSlots.filter(slot => slot.is_taken).map(slot => ({
          type: 'Time Slot',
          userName: slot.user_name,
          time: slot.time,
          songIds: slot.song_ids || [slot.song_id].filter(Boolean),
          instruments: slot.instruments || [],
          customInstrument: slot.custom_instrument || '',
          singingAlong: slot.singing_along || false
        })),
        ...queueEntries.map(entry => ({
          type: 'Queue',
          userName: entry.user_name,
          time: `Queue Position ${entry.queue_position}`,
          songIds: entry.song_ids || [entry.song_id].filter(Boolean),
          instruments: entry.instruments || [],
          customInstrument: entry.custom_instrument || '',
          singingAlong: entry.singing_along || false
        }))
      ];

      // Create CSV content with new column structure
      const headers = [
        'Name',
        'Time',
        'Song1',
        'Artist1',
        'Song2',
        'Artist2',
        'Song3',
        'Artist3',
        'Instrument1',
        'Instrument2',
        'CustomInstrument'
      ];

      const csvData = allPerformances.map(performance => {
        // Get song and artist information
        const songs = performance.songIds.slice(0, 3).map(songId => {
          const song = allSongs.find(s => s.id === songId);
          return song ? { title: song.title, artist: song.artist } : { title: '', artist: '' };
        });
        
        // Pad with empty songs if needed
        while (songs.length < 3) {
          songs.push({ title: '', artist: '' });
        }
        
        // Get instrument information (excluding 'Custom' since we have a separate column for custom instrument)
        const instruments = performance.instruments.filter(inst => inst !== 'Custom').slice(0, 2);
        while (instruments.length < 2) {
          instruments.push('');
        }
        
        return [
          performance.userName,
          performance.time,
          songs[0].title,
          songs[0].artist,
          songs[1].title,
          songs[1].artist,
          songs[2].title,
          songs[2].artist,
          instruments[0],
          instruments[1],
          performance.customInstrument
        ];
      });

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `karaoke_signups_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const unselectedSongs = allSongs.filter(song => song &&
    !selectedSongs.some(selected => selected.song_id === song.id) &&
    (song.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     song.artist?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const takenSlots = timeSlots.filter(slot => slot.is_taken);
  const availableForSelection = (activeSession?.use_all_songs ?? true) ? allSongs : selectedSongs.map(sel => allSongs.find(s => s.id === sel.song_id)).filter(Boolean);

  // Show loading state if no activeSession yet
  if (!activeSession) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <div className="text-white text-xl font-semibold">Loading Admin Session...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-amber-400/30">
      <CardHeader className="border-b border-amber-400/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-900" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Admin Control Panel
            </CardTitle>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-green-400/30 text-green-400 hover:bg-green-400/20 hover:text-green-300 text-sm px-3 py-2 sm:px-4 sm:py-2"
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              Export CSV
            </Button>
            
            {activeSession.is_active ? (
              <Button
                onClick={handleEndSession}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-1 sm:flex-none"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                End Karaoke Session
              </Button>
            ) : (
              <Button
                onClick={handleLaunchSession}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex-1 sm:flex-none"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Launch Karaoke Session
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 text-white">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-gray-800 border border-amber-400/30 w-full justify-start sm:w-auto sm:mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Event Settings</TabsTrigger>
              <TabsTrigger value="users">Manage Users</TabsTrigger>
              <TabsTrigger value="database">Song Database</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{takenSlots.length}</div>
                      <div className="text-gray-400 text-sm">Signed Up</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{timeSlots.length - takenSlots.length}</div>
                      <div className="text-gray-400 text-sm">Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{allSongs.length}</div>
                      <div className="text-gray-400 text-sm">Total Songs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-full text-lg bg-gray-800/50 border-amber-400/20 hover:bg-gray-700/50 text-amber-300 hover:text-amber-200" disabled={!activeSession.is_active}>
                        <QrCode className="w-6 h-6 mr-3"/>
                        Show QR Code
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Scan to Join!</DialogTitle>
                    </DialogHeader>
                    {qrCodeUrl ? (
                        <div className="flex items-center justify-center p-4">
                            <img src={qrCodeUrl} alt="Karaoke Session QR Code" />
                        </div>
                    ) : (
                        <p className="text-gray-600">Session is not live. Launch the session to generate a QR code.</p>
                    )}
                </DialogContent>
              </Dialog>

            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SchedulingSettings 
              activeSession={activeSession}
              onUpdateSession={handleUpdateSession}
              onGenerateSlots={handleGenerateSlots}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Event Title</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Input
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="bg-gray-800/50 border-amber-400/30 text-white flex-grow"
                />
                <Button
                  onClick={handleSaveTitle}
                  className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Title
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-400">Song Selection & Queueing</h3>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-blue-400" />
                        <div>
                        <Label className="text-white font-semibold">Use Entire Song Database</Label>
                        <p className="text-gray-400 text-sm">Toggle to use all songs or only selected ones</p>
                        </div>
                    </div>
                    <Switch checked={activeSession.use_all_songs || false} onCheckedChange={handleToggleUseAllSongs} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-green-400" />
                        <div>
                        <Label className="text-white font-semibold">Allow Reuse of Songs</Label>
                        <p className="text-gray-400 text-sm">When enabled, songs can be selected multiple times</p>
                        </div>
                    </div>
                    <Switch checked={activeSession.allow_song_reuse || false} onCheckedChange={handleToggleAllowReuse} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-cyan-400" />
                        <div>
                            <Label className="text-white font-semibold">Songs Per Performer</Label>
                            <p className="text-gray-400 text-sm">Set the max number of active sign-ups per person.</p>
                        </div>
                    </div>
                    <Select
                        value={(activeSession.performer_song_limit || 1).toString()}
                        onValueChange={(value) => handleUpdateSession({ performer_song_limit: parseInt(value) })}
                    >
                        <SelectTrigger className="w-24 bg-gray-900/50 border-amber-400/30 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!(activeSession.use_all_songs ?? true) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-400">Current Selection ({availableForSelection.length} songs)</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-900/30 rounded-lg">
                  {availableForSelection.map(song => (
                    <div key={song.id} className="flex items-center justify-between p-2 bg-gray-800/60 rounded">
                      <p>{song.title} - {song.artist}</p>
                      <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/50" onClick={() => handleRemoveSongFromSelection(selectedSongs.find(s=>s.song_id === song.id))}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-amber-400">Add Songs to Session</h3>
                 <Input
                  placeholder="Search available songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800/50 border-amber-400/30 text-white"
                />
                <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-900/30 rounded-lg">
                  {unselectedSongs.slice(0, 50).map(song => (
                    <div key={song.id} className="flex items-center justify-between p-2 bg-gray-800/60 rounded">
                      <p>{song.title} - {song.artist}</p>
                      <Button size="sm" onClick={() => handleAddSongToSelection(song)}>
                        <Plus className="w-4 h-4 mr-1"/> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-amber-400 whitespace-nowrap">User Management</h3>
                <Button
                  onClick={handleClearAllSlots}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All Sign-ups
                </Button>
              </div>

              {takenSlots.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white mb-3">Signed Up Users ({takenSlots.length})</h4>
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {takenSlots.map(slot => {
                      const song = allSongs.find(s => s.id === slot.song_ids?.[0]);
                      const secondarySongs = (slot.song_ids || [])
                        .slice(1)
                        .map(id => allSongs.find(s => s.id === id)?.title)
                        .filter(Boolean);
                      
                      const instruments = (slot.instruments || []).filter(inst => inst !== 'Custom').join(', ');
                      const customInstrument = slot.custom_instrument || '';

                      return (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">{slot.user_name}</div>
                              <div className="text-gray-400 text-sm">
                                {slot.time} • {song?.title || 'Unknown Song'} {secondarySongs.length > 0 ? ` (+${secondarySongs.join(', ')})` : ''}
                              </div>
                              {(instruments || customInstrument) && (
                                <div className="text-purple-300/80 text-xs mt-1">
                                  Instruments: {instruments}{instruments && customInstrument ? ', ' : ''}{customInstrument}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearSlot(slot)}
                            className="border-red-400/30 text-red-400 hover:bg-red-400/20"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No users signed up yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
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
            
            <SongImport 
              onImportComplete={onLoadData}
              allSongs={allSongs}
              setSongError={setSongError}
            />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-amber-400">Song Database ({allSongs.length} songs)</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {allSongs.map(song => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-600/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold">{song.title}</div>
                        <div className="text-gray-400 text-sm">by {song.artist}</div>
                      </div>
                      {song.genre && (
                        <Badge className="bg-purple-400/20 text-purple-200 border-purple-400/30">
                          {song.genre}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
