import React, { useState, useEffect, useCallback } from 'react';
import { AdminTimeSlot, Song, User, AdminSession, AdminSongSelection, QueueEntry } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Music,
  Crown,
  Clock,
  Sparkles,
  RefreshCw,
  Shield,
  ShieldOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TimeSlotGrid from "../components/TimeSlotGrid";
import SongSearchModal from "../components/SongSearchModal";
import AdminPanel from "../components/AdminPanel";
import AdminLogin from "../components/AdminLogin";
import QueueView from "../components/QueueView";

const timeToSortable = (timeStr) => {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  return hours * 60 + minutes;
};

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutesStr] = timeStr.split(':');
  const hoursNum = parseInt(hours);
  const minutes = parseInt(minutesStr);
  
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  let displayHour = hoursNum % 12;
  if (displayHour === 0) {
    displayHour = 12;
  }
  
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function KaraokePage() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentAdminUsername, setCurrentAdminUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [queueEntries, setQueueEntries] = useState([]);
  const [addSongInfo, setAddSongInfo] = useState(null);

  const initializeTimeSlots = useCallback(async (adminUsername) => {
    const slots = [];
    for (let hour = 19; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
        slots.push({
          admin_username: adminUsername,
          time: time12
        });
      }
    }

    const createdSlots = await AdminTimeSlot.bulkCreate(slots);
    const sortedCreated = createdSlots.sort((a, b) => timeToSortable(a.time) - timeToSortable(b.time));
    setTimeSlots(sortedCreated);
    return sortedCreated;
  }, []);

  const loadAdminData = useCallback(async (username) => {
    setIsLoading(true);
    try {
      const songs = await Song.list('title');
      setAllSongs(songs);
      setAvailableSongs(songs);

      const sessions = await AdminSession.filter({ admin_username: username });
      let adminSession = sessions.length > 0 ? sessions[0] : null;

      if (!adminSession) {
        adminSession = await AdminSession.create({
          admin_username: username,
          title: `${username}'s Karaoke Night`,
          is_active: false,
          use_all_songs: true,
          session_mode: 'time_slot',
          start_time: '19:00',
          end_time: '23:00',
          time_increment: 15
        });
      }
      setActiveSession(adminSession);

      if (adminSession.session_mode === 'time_slot') {
        let adminSlots = await AdminTimeSlot.filter({ admin_username: username }, 'time');
        if (adminSlots.length === 0) {
          adminSlots = await initializeTimeSlots(username);
        }
        setTimeSlots(adminSlots.sort((a, b) => timeToSortable(a.time) - timeToSortable(b.time)));
        setQueueEntries([]);
      } else {
        const queue = await QueueEntry.filter({ admin_username: username }, 'queue_position');
        setQueueEntries(queue);
        setTimeSlots([]);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [initializeTimeSlots]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setCurrentUser(null); 

    try {
      const songs = await Song.list('title');
      setAllSongs(songs);
      // setAvailableSongs(songs);

      const activeSessions = await AdminSession.filter({ is_active: true }, '-updated_date', 1);
      const publicActiveSession = activeSessions.length > 0 ? activeSessions[0] : null;

      if (!isAdminMode) {
        setActiveSession(publicActiveSession);
      }

      if (publicActiveSession) {
        if (publicActiveSession.session_mode === 'time_slot') {
          const adminSlots = await AdminTimeSlot.filter(
            { admin_username: publicActiveSession.admin_username },
            'time'
          );
          const sortedAdminSlots = adminSlots.sort((a, b) => timeToSortable(a.time) - timeToSortable(b.time));
          setTimeSlots(sortedAdminSlots);
          setQueueEntries([]);
        } else {
          const queue = await QueueEntry.filter({ admin_username: publicActiveSession.admin_username }, 'queue_position');
          setQueueEntries(queue);
          setTimeSlots([]);
        }
      } else {
        setTimeSlots([]);
        setAvailableSongs([]);
        setQueueEntries([]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    }finally{
      setIsLoading(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    if (!isAdminMode) {
      loadData();
    }
  }, [loadData, isAdminMode]);

  const handleSlotClick = (slot) => {
    setAddSongInfo(null);
    setSelectedSlot(slot);
    setShowSongModal(true);
  };

  const handleOpenAddSongModal = (slot) => {
    if (!isAdminMode) return;
    setSelectedSlot(null);
    setAddSongInfo({ slot });
    setShowSongModal(true);
  };

  const handleAdminLogin = async (username) => {
    setIsAdminMode(true);
    setCurrentAdminUsername(username);
    setShowAdminLogin(false);

    const existingSessions = await AdminSession.filter({ admin_username: username });
    if (existingSessions.length === 0) {
      await AdminSession.create({
        admin_username: username,
        title: `${username}'s Karaoke Night`,
        is_active: false,
        use_all_songs: true,
        session_mode: 'time_slot',
        start_time: '19:00',
        end_time: '23:00',
        time_increment: 15
      });
    }

    await loadAdminData(username);
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    setCurrentAdminUsername('');
    loadData();
  };

  const handleConfirmSignup = async (slot, userName, songs, instrumentData = {}) => {
    try {
      setShowSongModal(false);
      setSelectedSlot(null);
      
      const songIds = songs.map(s => s.id);
      await AdminTimeSlot.update(slot.id, {
        user_name: userName,
        song_ids: songIds,
        song_id: songIds[0] || null,
        is_taken: true,
        instruments: instrumentData.instruments || [],
        custom_instrument: instrumentData.custom_instrument || '',
        singing_along: instrumentData.singing_along || false
      });

      if (isAdminMode) {
        loadAdminData(currentAdminUsername);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error confirming signup:', error);
    }
  };

  const handleConfirmAddSong = async (songs) => {
    if (!addSongInfo || songs.length === 0) return;
    const { slot } = addSongInfo;
    
    try {
      setShowSongModal(false);
      setAddSongInfo(null);
      
      const newSongIds = [...(slot.song_ids || [])];
      
      const emptyIndex = newSongIds.findIndex(id => !id);
      if (emptyIndex !== -1) {
        newSongIds[emptyIndex] = songs[0].id;
      } else {
        newSongIds.push(songs[0].id);
      }

      await AdminTimeSlot.update(slot.id, {
        song_ids: newSongIds,
        song_id: newSongIds[0] || null
      });

      if (isAdminMode) {
        loadAdminData(currentAdminUsername);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error adding song to slot:', error);
    }
  };

  const handleAddToQueue = () => {
    setSelectedSlot(null);
    setAddSongInfo(null);
    setShowSongModal(true);
  };

  const handleConfirmQueueSignup = async (userName, songs, instrumentData = {}) => {
    try {
      setShowSongModal(false);
      setSelectedSlot(null);
      
      if (!activeSession || activeSession.session_mode !== 'order') {
        console.error('Cannot add to queue: not in order mode or no active session.');
        return;
      }
      const existingQueue = await QueueEntry.filter({ admin_username: activeSession.admin_username }, 'queue_position');
      const nextPosition = existingQueue.length > 0 ? Math.max(...existingQueue.map(e => e.queue_position)) + 1 : 1;
      
      const songIds = songs.map(s => s.id);

      await QueueEntry.create({
        admin_username: activeSession.admin_username,
        user_name: userName,
        song_ids: songIds,
        song_id: songIds[0] || null,
        queue_position: nextPosition,
        status: 'waiting',
        instruments: instrumentData.instruments || [],
        custom_instrument: instrumentData.custom_instrument || '',
        singing_along: instrumentData.singing_along || false
      });

      if (isAdminMode) {
        loadAdminData(currentAdminUsername);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  const handleUpdateQueueStatus = async (entry, newStatus) => {
    try {
      await QueueEntry.update(entry.id, { status: newStatus });

      if (newStatus === 'done' || newStatus === 'performing') {
        const currentQueue = await QueueEntry.filter({
          admin_username: activeSession.admin_username,
          status: 'waiting'
        }, 'queue_position');

        for (let i = 0; i < currentQueue.length; i++) {
          if (currentQueue[i].queue_position !== (i + 1)) {
            await QueueEntry.update(currentQueue[i].id, { queue_position: i + 1 });
          }
        }
      }

      if (isAdminMode) {
        loadAdminData(currentAdminUsername);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error updating queue status:', error);
    }
  };

  const handleMoveInQueue = async (entry, direction) => {
    try {
      const queue = await QueueEntry.filter({
        admin_username: activeSession.admin_username,
        status: 'waiting'
      }, 'queue_position');

      const currentIndex = queue.findIndex(q => q.id === entry.id);
      if (currentIndex === -1) return;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= queue.length) return;

      const entryToMove = queue[currentIndex];
      const otherEntry = queue[swapIndex];

      await QueueEntry.update(entryToMove.id, { queue_position: otherEntry.queue_position });
      await QueueEntry.update(otherEntry.id, { queue_position: entryToMove.queue_position });

      loadAdminData(currentAdminUsername);
    } catch (error) {
      console.error('Error moving in queue:', error);
    }
  };

  const handleRemoveFromQueue = async (entry) => {
    try {
      await QueueEntry.delete(entry.id);

      const remainingQueue = await QueueEntry.filter({
        admin_username: activeSession.admin_username,
        status: 'waiting'
      }, 'queue_position');

      for (let i = 0; i < remainingQueue.length; i++) {
        if (remainingQueue[i].queue_position !== (i + 1)) {
          await QueueEntry.update(remainingQueue[i].id, { queue_position: i + 1 });
        }
      }

      if (isAdminMode) {
        loadAdminData(currentAdminUsername);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  };

  const handleRemoveSong = async (slot, songIndex) => {
    if (!isAdminMode) return;

    try {
      const currentSongIds = slot.song_ids || [];
      const updatedSongIds = [...currentSongIds];

      updatedSongIds.splice(songIndex, 1);

      await AdminTimeSlot.update(slot.id, {
        song_ids: updatedSongIds,
        song_id: updatedSongIds[0] || null
      });

      loadAdminData(currentAdminUsername);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
          <div className="text-white text-xl font-semibold">Loading Karaoke Night...</div>
        </div>
      </div>
    );
  }

  if (!activeSession && !isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto">
            <Music className="w-12 h-12 text-gray-900" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Karaoke Night</h1>
            <p className="text-gray-400 text-lg mb-8">No active karaoke session right now</p>
            <Button
              onClick={() => setShowAdminLogin(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 font-semibold"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>
        </div>

        <AdminLogin
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onAdminLogin={handleAdminLogin}
        />
      </div>
    );
  }

  const displayTitle = activeSession?.title || "Live Karaoke Night";
  const isOrderMode = activeSession?.session_mode === 'order';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600')] bg-cover bg-center opacity-5" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <Music className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  {displayTitle}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <p className="text-amber-200/80 text-lg">Sign up • Sing • Shine</p>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 flex-wrap">
              {isAdminMode && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-300 font-semibold">Admin: {currentAdminUsername}</span>
                    {!activeSession?.is_active && (
                      <Badge className="bg-red-400/20 text-red-200 border-red-400/30">
                        Draft Mode
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleAdminLogout}
                    variant="outline"
                    className="border-red-400/30 text-red-400 hover:bg-red-400/20 hover:text-red-300"
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Exit Admin Mode
                  </Button>
                </>
              )}

              {!isAdminMode && (
                <Button
                  onClick={() => setShowAdminLogin(true)}
                  variant="outline"
                  className="border-amber-400/30 text-amber-400 hover:bg-amber-400/20 hover:text-amber-300"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              )}
            </div>
          </motion.div>

          {isAdminMode && (
            <motion.div
              initial={{ opacity: 0, height: 'auto' }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-visible"
            >
              <AdminPanel
                adminUsername={currentAdminUsername}
                allSongs={allSongs}
                timeSlots={timeSlots}
                activeSession={activeSession}
                queueEntries={queueEntries}
                onLoadData={async () => {
                  await loadAdminData(currentAdminUsername);
                  await loadData();
                }}
                onAddToQueue={handleAddToQueue}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/40 border-amber-400/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-amber-400/20 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Clock className="w-8 h-8 text-amber-400" />
                  {isOrderMode ? "Performance Queue" : "Tonight's Schedule"}
                  {!isOrderMode && (
                    <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30">
                      {formatTime12Hour(activeSession?.start_time) || '7:00 PM'} - {formatTime12Hour(activeSession?.end_time) || '12:00 AM'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isOrderMode ? (
                  <QueueView
                    queueEntries={queueEntries}
                    songs={isAdminMode ? allSongs : availableSongs}
                    onAddToQueue={handleAddToQueue}
                    onUpdateStatus={handleUpdateQueueStatus}
                    onMoveInQueue={handleMoveInQueue}
                    onRemoveFromQueue={handleRemoveFromQueue}
                    currentUser={currentUser}
                    isAdminMode={isAdminMode}
                  />
                ) : (
                  <TimeSlotGrid
                    timeSlots={timeSlots}
                    songs={isAdminMode ? allSongs : availableSongs}
                    onSlotClick={handleSlotClick}
                    onAddSongClick={handleOpenAddSongModal}
                    currentUser={currentUser}
                    isAdminMode={isAdminMode}
                    activeSession={activeSession}
                    onClearSlot={async (slot) => {
                       await AdminTimeSlot.update(slot.id, {
                          user_name: null,
                          song_ids: [],
                          song_id: null,
                          is_taken: false,
                          instruments: [],
                          custom_instrument: '',
                          singing_along: false
                        });
                        loadAdminData(currentAdminUsername);
                    }}
                    onRemoveSong={handleRemoveSong}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <SongSearchModal
        isOpen={showSongModal}
        onClose={() => {
          setShowSongModal(false);
          setAddSongInfo(null);
          setSelectedSlot(null);
        }}
        songs={availableSongs}
        slotInfo={addSongInfo ? { slot: addSongInfo.slot, mode: 'add' } : { slot: selectedSlot, mode: isOrderMode ? 'queue' : 'signup' }}
        onConfirm={addSongInfo ? handleConfirmAddSong : (isOrderMode ? handleConfirmQueueSignup : handleConfirmSignup)}
        currentUser={currentUser}
        isAdminMode={isAdminMode}
        activeSession={activeSession}
        timeSlots={isOrderMode ? [] : timeSlots}
        queueEntries={isOrderMode ? queueEntries : []}
        isOrderMode={isOrderMode}
      />

      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onAdminLogin={handleAdminLogin}
      />
    </div>
  );
}