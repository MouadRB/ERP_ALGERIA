'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export interface CatalogueStats {
  total: number;
  published: number;
  masked: number;
  scheduled: number;
  draft: number;
  partial: number;
  pendingPublication: number;
  rupture: number;
  lowStock: number;
  indexed: number;
  totalValue: number;
}

export const useCatalogueStats = () =>
  useQuery({
    queryKey: ['catalogue', 'stats'],
    queryFn: () => fetchBFF<ApiResponse<CatalogueStats>>('/bff/catalogue/stats'),
  });
