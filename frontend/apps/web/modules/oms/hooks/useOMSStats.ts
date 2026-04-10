'use client';

import { useQuery }  from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';

export interface OMSStats {
  confirmer:    number;
  confirmes:    number;
  enLivraison:  number;
  livres:       number;
  echecs:       number;
  annules:      number;

  expirentBientot: number;
  caLivres:        number;
  carriersEnLivraison: {
    Yalidine: number;
    Maystro:  number;
    autres:   number;
  };
  retoursStock:  number;
  quarantaine:   number;
  annulesAuto:   number;
  annulesManuel: number;

  funnel: {
    recues:     number;
    confirmees: number;
    expediees:  number;
    livrees:    number;
    echecs:     number;
  };

  tauxConfirmation: number;
  tauxLivraison:    number;
  tauxEchec:        number;
  tauxAnnulation:   number;

  lastUpdatedAt: string;
}

interface StatsResponse {
  data: OMSStats;
}

export const useOMSStats = () =>
  useQuery({
    queryKey:        ['oms', 'stats'],
    queryFn:         () => fetchBFF<StatsResponse>('/bff/oms/stats'),
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });