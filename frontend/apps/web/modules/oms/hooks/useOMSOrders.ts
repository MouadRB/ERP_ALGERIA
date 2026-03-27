'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF, type ParamValue } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; pageSize: number };
}

interface UseOMSOrdersParams extends Record<string, ParamValue> {
  page?:     number;
  pageSize?: number;
  search?:   string;
  status?:   string;
  carrier?:  string;
  wilaya?:   string;
  dateFrom?: string;
  dateTo?:   string;
  codMin?:   number;
  codMax?:   number;
  riskLevel?: string;
  source?:   string;
  attempts?: number;
  hasCarrier?: boolean;
  customerId?: string;
}

export const useOMSOrders = (params: UseOMSOrdersParams = {}) =>
  useQuery({
    queryKey: ['oms', 'orders', params],
    queryFn:  () =>
      fetchBFF<OrdersResponse>('/bff/oms', { params }),
  });
