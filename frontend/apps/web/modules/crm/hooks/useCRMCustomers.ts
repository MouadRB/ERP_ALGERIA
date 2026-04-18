'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF, type ParamValue } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

export interface UseCRMCustomersParams {
  page?:       number;
  pageSize?:   number;
  search?:     string;
  segment?:    string;
  wilayaCode?: string;
  blacklisted?: boolean;
  sort?:       string;
  riskLevel?:  string;
}

export const useCRMCustomers = (params: UseCRMCustomersParams = {}) =>
  useQuery({
    queryKey: ['crm', 'customers', params],
    queryFn:  () => fetchBFF<ApiResponse<Customer[]>>('/bff/crm', { params: params as Record<string, ParamValue> }),
  });
