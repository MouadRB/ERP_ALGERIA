'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PeriodPreset = 'today' | '7d' | '30d' | 'quarter' | 'year' | 'custom';

export interface PeriodContextValue {
  period:      PeriodPreset;
  lastRefresh: Date;
  setPeriod:      (p: PeriodPreset) => void;
  refresh:        () => void;
}

const PeriodContext = React.createContext<PeriodContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [period,     setPeriod]     = React.useState<PeriodPreset>('30d');
  const [lastRefresh, setLastRefresh] = React.useState(() => new Date());

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rapports'] });
    setLastRefresh(new Date());
  }, [queryClient]);

  const value = React.useMemo<PeriodContextValue>(
    () => ({ period, lastRefresh, setPeriod, refresh }),
    [period, lastRefresh, refresh],
  );

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePeriod(): PeriodContextValue {
  const ctx = React.useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used inside <PeriodProvider>');
  return ctx;
}
