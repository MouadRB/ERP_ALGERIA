'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface CatalogueEntry {
  id: string;
  productId: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  priceTTC: number;
  status: 'draft' | 'published' | 'scheduled' | 'unpublished';
  publishedAt: string | null;
  channels: string[];
  openSearchIndexed: boolean;
}

interface UseCatalogueParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export const useCatalogue = (params: UseCatalogueParams = {}) => {
  return useQuery({
    queryKey: ['catalogue', 'list', params],
    queryFn: () =>
      fetchBFF<ApiResponse<CatalogueEntry[]>>('/bff/catalogue', { params }),
  });
};