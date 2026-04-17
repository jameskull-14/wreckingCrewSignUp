import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Types for your data
interface Participant {
  id: string;
  user_name: string;
  time?: string;
  song_ids?: string[];
  queue_position?: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
}

interface Session {
  id: string;
  admin_username: string;
  title: string;
  is_active: boolean;
  session_mode: 'time_slot' | 'queue';
  start_time?: string;
  end_time?: string;
  time_increment?: number;
}

interface TimeSlot {
  id: string;
  time: string;
  user_name?: string;
  is_taken: boolean;
  song_ids?: string[];
}

// What the context provides
interface AppContextType {
  // Data
  participants: Participant[];
  songs: Song[];
  session: Session | null;
  timeSlots: TimeSlot[];
  isLoading: boolean;

  // Computed values
  participantCount: number;
  availableSlots: number;
  totalSlots: number;

  // Setters
  setParticipants: (participants: Participant[]) => void;
  setSongs: (songs: Song[]) => void;
  setSession: (session: Session | null) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  setIsLoading: (loading: boolean) => void;

  // Actions
  refreshData: () => Promise<void>;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const participantCount = participants.length;
  const totalSlots = timeSlots.length;
  const availableSlots = timeSlots.filter(slot => !slot.is_taken).length;

  // Refresh all data - implement your API calls here
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Add your API calls here
      // const fetchedSongs = await Song.list('title');
      // setSongs(fetchedSongs);
      // etc.
      console.log('refreshData called - implement API calls');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AppContextType = {
    // Data
    participants,
    songs,
    session,
    timeSlots,
    isLoading,

    // Computed
    participantCount,
    availableSlots,
    totalSlots,

    // Setters
    setParticipants,
    setSongs,
    setSession,
    setTimeSlots,
    setIsLoading,

    // Actions
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook - makes it easy to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
