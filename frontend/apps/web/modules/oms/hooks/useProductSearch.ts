'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

export interface ProductSearchItem {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  priceTTC: number;
  tvaRate: string;
  imageUrl?: string;
}

interface ProductSearchResponse {
  data: ProductSearchItem[];
  meta?: { total: number };
}

export const useProductSearch = (search: string) =>
  useQuery({
    queryKey: ['oms', 'product-search', search],
    queryFn: () =>
      fetchBFF<ProductSearchResponse>('/bff/pim/products', {
        params: { search },
      }),
    enabled: search.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
