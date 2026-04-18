'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { CatalogueEntry } from '../catalogue.types';

export const useCatalogueItem = (id: string) =>
  useQuery({
    queryKey: ['catalogue', 'item', id],
    queryFn: () => fetchBFF<ApiResponse<CatalogueEntry>>(`/bff/catalogue/${id}`),
    enabled: Boolean(id),
  });
