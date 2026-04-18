'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { CatalogueHistoryItem } from '../catalogue.types';

export const useCatalogueHistory = (id: string) =>
  useQuery({
    queryKey: ['catalogue', 'history', id],
    queryFn: () => fetchBFF<ApiResponse<CatalogueHistoryItem[]>>(`/bff/catalogue/${id}/history`),
    enabled: Boolean(id),
  });
