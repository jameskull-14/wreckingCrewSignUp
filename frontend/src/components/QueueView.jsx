
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, User, Play, Check, Clock, Plus, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QueueView({ 
  queueEntries, 
  songs, 
  onAddToQueue, 
  onUpdateStatus, 
  onMoveInQueue, 
  onRemoveFromQueue,
  currentUser,
  isAdminMode 
}) {
  const getSongInfo = (songId) => {
    return songs.find(s => s.id === songId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-blue-400/20 text-blue-200 border-blue-400/30';
      case 'performing': return 'bg-green-400/20 text-green-200 border-green-400/30';
      case 'completed': return 'bg-gray-400/20 text-gray-200 border-gray-400/30';
      default: return 'bg-blue-400/20 text-blue-200 border-blue-400/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'performing': return <Play className="w-4 h-4" />;
      case 'completed': return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const waitingEntries = queueEntries.filter(entry => entry.status === 'waiting').sort((a, b) => a.queue_position - b.queue_position);
  const performingEntries = queueEntries.filter(entry => entry.status === 'performing');
  const completedEntries = queueEntries.filter(entry => entry.status === 'completed').sort((a, b) => b.updated_date - a.updated_date);

  return (
    <div className="space-y-6">
      {/* Add to Queue Button */}
      <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-400/30">
        <CardContent className="p-6 text-center">
          <Button
            onClick={onAddToQueue}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-gray-900 font-semibold text-lg px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isAdminMode ? 'Add Performer to Queue' : 'Join the Queue'}
          </Button>
        </CardContent>
      </Card>

      {/* Currently Performing */}
      {performingEntries.length > 0 && (
        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-400 flex items-center gap-3">
              <Play className="w-6 h-6" />
              Now Performing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performingEntries.map((entry) => {
              const song = getSongInfo(entry.song_ids?.[0]);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-400/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-gray-900 font-bold text-lg">
                        {entry.user_name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white">{entry.user_name}</div>
                        {song && (
                          <div className="text-green-200/80">
                            {song.title} by {song.artist}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                           {(entry.instruments || []).filter(inst => inst !== 'Custom').map(instrument => (
                              <Badge key={instrument} variant="secondary" className="bg-green-400/20 text-green-200 border-green-400/30">
                                  {instrument}
                              </Badge>
                          ))}
                          {entry.custom_instrument && (
                              <Badge variant="secondary" className="bg-green-400/20 text-green-200 border-green-400/30">
                                  {entry.custom_instrument}
                              </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdminMode && (
                      <Button
                        onClick={() => onUpdateStatus(entry, 'completed')}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Queue */}
      <Card className="bg-gray-900/40 border-amber-400/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <User className="w-6 h-6 text-amber-400" />
            Performance Queue ({waitingEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {waitingEntries.map((entry, index) => {
              const song = getSongInfo(entry.song_ids?.[0]);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/30">
                        <span className="text-amber-400 font-bold">#{entry.queue_position}</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-gray-900 font-bold text-lg">
                        {entry.user_name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{entry.user_name}</div>
                        {song && (
                          <div className="text-amber-200/80 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            {song.title} by {song.artist}
                          </div>
                        )}
                         <div className="flex flex-wrap gap-1 mt-2">
                           {(entry.instruments || []).filter(inst => inst !== 'Custom').map(instrument => (
                              <Badge key={instrument} variant="secondary" className="bg-purple-400/20 text-purple-200 border-purple-400/30">
                                  {instrument}
                              </Badge>
                          ))}
                          {entry.custom_instrument && (
                              <Badge variant="secondary" className="bg-purple-400/20 text-purple-200 border-purple-400/30">
                                  {entry.custom_instrument}
                              </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdminMode && (
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Button
                            onClick={() => onUpdateStatus(entry, 'performing')}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Performance
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMoveInQueue(entry, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-white"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMoveInQueue(entry, 'down')}
                          disabled={index === waitingEntries.length - 1}
                          className="text-gray-400 hover:text-white"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveFromQueue(entry)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {waitingEntries.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No one in queue yet</p>
              <p className="text-sm">Be the first to join!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Performances */}
      {completedEntries.length > 0 && (
        <Card className="bg-gray-900/20 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-400 flex items-center gap-3">
              <Check className="w-5 h-5" />
              Completed Performances ({completedEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {completedEntries.slice(0, 10).map((entry) => {
              const song = getSongInfo(entry.song_id);
              return (
                <div
                  key={entry.id}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600/50 flex items-center justify-center text-gray-400 font-bold text-sm">
                    {entry.user_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-300">{entry.user_name}</div>
                    {song && (
                      <div className="text-gray-500 text-sm">{song.title} by {song.artist}</div>
                    )}
                  </div>
                  <Badge className={getStatusColor(entry.status)}>
                    {getStatusIcon(entry.status)}
                    Completed
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
