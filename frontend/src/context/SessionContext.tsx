import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Session {
  id: string;
  admin_username: string;
  title: string;
  is_active: boolean;
  session_mode: 'time_slot' | 'queue';
  start_time?: string;
  end_time?: string;
  time_increment?: number;
  use_all_songs?: boolean;
  allow_song_reuse?: boolean;
  performer_song_limit?: number;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateSession: (updates: Partial<Session>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateSession = (updates: Partial<Session>) => {
    if (session) {
      setSession({ ...session, ...updates });
    }
  };

  const value: SessionContextType = {
    session,
    isLoading,
    setSession,
    setIsLoading,
    updateSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
