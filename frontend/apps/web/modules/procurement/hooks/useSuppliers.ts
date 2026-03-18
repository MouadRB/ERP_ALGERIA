'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface Supplier {
  id: string;
  name: string;
  wilayaCode: string;
  phone: string;
  email: string | null;
  totalBCs: number;
}

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['procurement', 'suppliers'],
    queryFn: () =>
      fetchBFF<ApiResponse<Supplier[]>>('/bff/procurement/suppliers'),
  });
};