import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TimeSlot {
  id: string;
  time: string;
  user_name?: string;
  is_taken: boolean;
  song_ids?: string[];
  instruments?: string[];
  custom_instrument?: string;
  singing_along?: boolean;
}

interface QueueEntry {
  id: string;
  user_name: string;
  song_ids: string[];
  queue_position: number;
  status: 'waiting' | 'performing' | 'done';
  instruments?: string[];
  custom_instrument?: string;
  singing_along?: boolean;
}

interface ParticipantsContextType {
  timeSlots: TimeSlot[];
  queueEntries: QueueEntry[];

  // Computed values
  participantCount: number;
  availableSlots: number;
  totalSlots: number;
  takenSlots: TimeSlot[];

  // Setters
  setTimeSlots: (slots: TimeSlot[]) => void;
  setQueueEntries: (entries: QueueEntry[]) => void;

  // Actions
  clearSlot: (slotId: string) => void;
  clearAllSlots: () => void;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined);

interface ParticipantsProviderProps {
  children: ReactNode;
}

export function ParticipantsProvider({ children }: ParticipantsProviderProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);

  // Computed values
  const takenSlots = timeSlots.filter(slot => slot.is_taken);
  const participantCount = takenSlots.length + queueEntries.length;
  const totalSlots = timeSlots.length;
  const availableSlots = timeSlots.filter(slot => !slot.is_taken).length;

  // Actions
  const clearSlot = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot =>
      slot.id === slotId
        ? { ...slot, user_name: undefined, is_taken: false, song_ids: [] }
        : slot
    ));
  };

  const clearAllSlots = () => {
    setTimeSlots(prev => prev.map(slot => ({
      ...slot,
      user_name: undefined,
      is_taken: false,
      song_ids: [],
      instruments: [],
      custom_instrument: undefined,
      singing_along: false,
    })));
    setQueueEntries([]);
  };

  const value: ParticipantsContextType = {
    timeSlots,
    queueEntries,
    participantCount,
    availableSlots,
    totalSlots,
    takenSlots,
    setTimeSlots,
    setQueueEntries,
    clearSlot,
    clearAllSlots,
  };

  return (
    <ParticipantsContext.Provider value={value}>
      {children}
    </ParticipantsContext.Provider>
  );
}

export function useParticipants() {
  const context = useContext(ParticipantsContext);
  if (context === undefined) {
    throw new Error('useParticipants must be used within a ParticipantsProvider');
  }
  return context;
}
