'use client';

import { Box, Button, Typography } from '@mui/material';
import * as React from 'react';
import { useMemo, useState } from 'react';
import type { Order, OrderState } from '@ferza/shared';
import { useOMSOrders }    from '@/modules/oms/hooks/useOMSOrders';
import { useDebounce }     from '@/hooks/shared/useDebounce';
import type { AdvancedFilters } from '@/modules/oms/components/stats/AdvancedFiltersDrawer';
import OrdersFilters, {
  type OrderFilters,
  type DateFilter,
  type SortFilter,
} from './OrdersFilters';
import OrdersTable from './OrdersTable';

interface ToutesCommandesTabProps {
  /** Pre-set carrier filter (from Suivi Carrier tab cross-navigation) */
  carrierFilter?: string | null;
  /** Clear the external carrier filter */
  onClearCarrierFilter?: () => void;
  /** Advanced filters applied from the drawer */
  advancedFilters?: AdvancedFilters;
}

const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  dateFrom: null,
  dateTo: null,
  codMin: null,
  codMax: null,
  riskLevel: [],
  source: [],
  attempts: null,
  hasCarrier: null,
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const parseDateInput = (value: string | null) => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toISOStart = (value: string | null) => {
  const dt = parseDateInput(value);
  return dt ? startOfDay(dt).toISOString() : null;
};

const toISOEnd = (value: string | null) => {
  const dt = parseDateInput(value);
  return dt ? endOfDay(dt).toISOString() : null;
};

const resolveDateRange = (
  quick: DateFilter,
  advancedFrom: string | null,
  advancedTo: string | null,
): { dateFrom: string | null; dateTo: string | null } => {
  // Advanced date range takes precedence over quick filter
  if (advancedFrom || advancedTo) {
    return {
      dateFrom: toISOStart(advancedFrom),
      dateTo: toISOEnd(advancedTo),
    };
  }

  // 'all' means no date filtering — return the full dataset
  if (quick === 'all') {
    return { dateFrom: null, dateTo: null };
  }

  const now = new Date();
  if (quick === 'today') {
    return { dateFrom: startOfDay(now).toISOString(), dateTo: endOfDay(now).toISOString() };
  }
  if (quick === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { dateFrom: startOfDay(y).toISOString(), dateTo: endOfDay(y).toISOString() };
  }
  if (quick === '7days') {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { dateFrom: startOfDay(from).toISOString(), dateTo: endOfDay(now).toISOString() };
  }
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  return { dateFrom: startOfDay(from).toISOString(), dateTo: endOfDay(now).toISOString() };
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function ToutesCommandesTab({
  carrierFilter = null,
  onClearCarrierFilter,
  advancedFilters,
}: ToutesCommandesTabProps) {
  const adv = advancedFilters ?? EMPTY_ADVANCED_FILTERS;

  // â”€â”€ Filter state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [filters, setFilters] = useState<OrderFilters>({
    search:  '',
    status:  '',
    carrier: '',
    wilaya:  '',
    date:    'all',
    sort:    'date_desc',
  });

  const [rawSearch, setRawSearch] = useState('');
  const debouncedSearch = useDebounce(rawSearch, 350);

  React.useEffect(() => {
    if (carrierFilter) {
      setFilters((prev) => ({ ...prev, carrier: carrierFilter }));
      setPage(0);
    }
  }, [carrierFilter]);

  React.useEffect(() => {
    setPage(0);
  }, [adv]);

  // â”€â”€ Pagination state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [page,     setPage]     = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // â”€â”€ Selection state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { dateFrom, dateTo } = useMemo(
    () => resolveDateRange(filters.date, adv.dateFrom, adv.dateTo),
    [filters.date, adv.dateFrom, adv.dateTo],
  );

  const carrierValue = carrierFilter ?? filters.carrier;
  const riskLevelParam = adv.riskLevel.length > 0 ? adv.riskLevel.join(',') : undefined;
  const sourceParam = adv.source.length > 0 ? adv.source.join(',') : undefined;

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      carrier: carrierValue || undefined,
      wilaya: filters.wilaya || undefined,
      dateFrom: dateFrom ?? undefined,
      dateTo: dateTo ?? undefined,
      codMin: adv.codMin ?? undefined,
      codMax: adv.codMax ?? undefined,
      riskLevel: riskLevelParam,
      source: sourceParam,
      attempts: adv.attempts ?? undefined,
      hasCarrier: adv.hasCarrier ?? undefined,
      sort: filters.sort,
    }),
    [
      page,
      pageSize,
      debouncedSearch,
      filters.status,
      filters.wilaya,
      filters.sort,
      carrierValue,
      dateFrom,
      dateTo,
      adv.codMin,
      adv.codMax,
      riskLevelParam,
      sourceParam,
      adv.attempts,
      adv.hasCarrier,
    ],
  );

  const { data, isLoading } = useOMSOrders(queryParams);
  const allOrders: Order[]  = (data?.data as Order[] | undefined) ?? [];
  const total = data?.meta?.total ?? allOrders.length;

  // â”€â”€ Derived wilayas for dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const uniqueWilayas = useMemo(() => {
    const codes = new Set(allOrders.map((o) => o.wilayaCode));
    return Array.from(codes).sort();
  }, [allOrders]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const setFilter = <K extends keyof OrderFilters>(key: K, val: OrderFilters[K]) => {
    if (key === 'carrier' && carrierFilter) {
      onClearCarrierFilter?.();
    }
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(0);
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds = allOrders.map((o) => o.id);
    const allPageSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <Box>
      {/* â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {carrierFilter && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            mb: 1.5,
            borderRadius: 2,
            backgroundColor: '#E3F2FD',
            border: '1px solid #90CAF9',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#0D47A1', fontWeight: 600 }}>
            Filtre par carrier : {carrierFilter}
          </Typography>
          <Button
            size="small"
            onClick={() => {
              setFilters((prev) => ({ ...prev, carrier: '' }));
              onClearCarrierFilter?.();
            }}
            sx={{ fontSize: 12, textTransform: 'none', color: '#0D47A1' }}
          >
            Effacer le filtre
          </Button>
        </Box>
      )}
      <OrdersFilters
        filters={{ ...filters, search: rawSearch }}
        wilayas={uniqueWilayas}
        onSearch={(v) => { setRawSearch(v); setPage(0); }}
        onStatus={(v) => setFilter('status', v as OrderState | '')}
        onCarrier={(v) => setFilter('carrier', v)}
        onWilaya={(v) => setFilter('wilaya', v)}
        onDate={(v) => setFilter('date', v as DateFilter)}
        onSort={(v) => setFilter('sort', v as SortFilter)}
        totalShown={total}
        totalAll={total}
      />

      {/* â”€â”€ Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <OrdersTable
        orders={allOrders}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleOne={toggleOne}
        onToggleAll={toggleAll}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
      />
    </Box>
  );
}
