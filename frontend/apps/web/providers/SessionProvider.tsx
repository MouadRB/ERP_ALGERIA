'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { FerzaSession } from '@/lib/session';
import { getMockSession, isMockMode } from '@/lib/session';

interface SessionContextValue {
  session: FerzaSession | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: false,
});

export const useSession = (): SessionContextValue =>
  useContext(SessionContext);

type SessionProviderProps = {
  children: React.ReactNode;
  initialSession?: FerzaSession | null;
};

export default function SessionProvider({
  children,
  initialSession = null,
}: SessionProviderProps) {
  const session = useMemo<FerzaSession | null>(() => {
    if (isMockMode()) return getMockSession();
    return initialSession;
  }, [initialSession]);

  const value = useMemo(
    () => ({ session, isLoading: false }),
    [session],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}