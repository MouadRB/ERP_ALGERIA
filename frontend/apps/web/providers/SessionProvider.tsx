'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FerzaSession, SessionLocale } from '@/lib/session';
import {
  AUTH_SESSION_EVENT,
  clearStoredAuthSession,
  getStoredSession,
  persistAuthSession,
} from '@/lib/session';

interface SessionContextValue {
  session: FerzaSession | null;
  isLoading: boolean;
  signIn: (payload: {
    token: string;
    expiry: string | null;
    rememberMe: boolean;
  }) => FerzaSession | null;
  signOut: () => void;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
  signIn: () => null,
  signOut: () => {},
  refreshSession: () => {},
});

export const useSession = (): SessionContextValue =>
  useContext(SessionContext);

type SessionProviderProps = {
  children: React.ReactNode;
  initialSession?: FerzaSession | null;
  locale: SessionLocale;
};

export default function SessionProvider({
  children,
  initialSession = null,
  locale,
}: SessionProviderProps) {
  const [session, setSession] = useState<FerzaSession | null>(initialSession);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(() => {
    const nextSession = getStoredSession(locale) ?? initialSession;
    setSession(nextSession);
    setIsLoading(false);
  }, [initialSession, locale]);

  useEffect(() => {
    refreshSession();

    const syncSession = () => refreshSession();

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, [refreshSession]);

  const signIn = useCallback(
    ({
      token,
      expiry,
      rememberMe,
    }: {
      token: string;
      expiry: string | null;
      rememberMe: boolean;
    }): FerzaSession | null => {
      const nextSession = persistAuthSession({
        token,
        expiry,
        locale,
        rememberMe,
      });

      if (!nextSession?.role) {
        clearStoredAuthSession();
        setSession(null);
        setIsLoading(false);
        return nextSession;
      }

      setSession(nextSession);
      setIsLoading(false);
      return nextSession;
    },
    [locale],
  );

  const signOut = useCallback(() => {
    clearStoredAuthSession();
    setSession(null);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signOut,
      refreshSession,
    }),
    [isLoading, refreshSession, session, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
