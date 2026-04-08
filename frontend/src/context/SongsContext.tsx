import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
}

interface SongsContextType {
  songs: Song[];
  songCount: number;
  setSongs: (songs: Song[]) => void;
  addSong: (song: Song) => void;
  removeSong: (songId: string) => void;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

interface SongsProviderProps {
  children: ReactNode;
}

export function SongsProvider({ children }: SongsProviderProps) {
  const [songs, setSongs] = useState<Song[]>([]);

  const songCount = songs.length;

  const addSong = (song: Song) => {
    setSongs(prev => [...prev, song]);
  };

  const removeSong = (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
  };

  const value: SongsContextType = {
    songs,
    songCount,
    setSongs,
    addSong,
    removeSong,
  };

  return (
    <SongsContext.Provider value={value}>
      {children}
    </SongsContext.Provider>
  );
}

export function useSongs() {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error('useSongs must be used within a SongsProvider');
  }
  return context;
}
