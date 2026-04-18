'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF, type ParamValue } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { CatalogueEntry, CatalogueStockStatus, CatalogueStatus } from '../catalogue.types';

interface UseCatalogueParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CatalogueStatus | '';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  stockStatus?: CatalogueStockStatus | '';
  channel?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export const useCatalogue = (params: UseCatalogueParams = {}) =>
  useQuery({
    queryKey: ['catalogue', 'list', params],
    queryFn: () => fetchBFF<ApiResponse<CatalogueEntry[]>>('/bff/catalogue', { params: params as Record<string, ParamValue> }),
  });
