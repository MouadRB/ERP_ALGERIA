'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCRMCustomers }  from '@/modules/crm/hooks/useCRMCustomers';
import type { Customer }    from '@ferza/shared';
import CustomerFilters, { type CustomerFilterState } from './CustomerFilters';
import QuickFilterChips     from './QuickFilterChips';
import CustomerTable        from './CustomerTable';
import type { CRMStats }    from '@/modules/crm/hooks/useCRMStats';

interface Props {
  stats:           CRMStats | null;
  initialSegment?: string;
  onOpenTicket:    (customer: Customer) => void;
  onBlacklist:     (customer: Customer) => void;
}

const DEFAULT_FILTERS: CustomerFilterState = {
  search:     '',
  segment:    '',
  wilayaCode: '',
  sort:       'last_order',
  riskLevel:  '',
};

export default function TousLesClientsTab({ stats, initialSegment, onOpenTicket, onBlacklist }: Props) {
  const router = useRouter();
  const locale = (useParams()?.locale as string | undefined) ?? 'fr';

  const [filters, setFilters] = React.useState<CustomerFilterState>(() => ({
    ...DEFAULT_FILTERS,
    segment: initialSegment ?? '',
  }));

  // Apply initialSegment when it changes from parent (e.g., "Voir tous les VIP")
  React.useEffect(() => {
    if (initialSegment) {
      setFilters((prev) => ({ ...prev, segment: initialSegment }));
    }
  }, [initialSegment]);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [page,     setPage]     = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [filters.segment, debouncedSearch, filters.wilayaCode, filters.sort, filters.riskLevel]);

  const query = useCRMCustomers({
    page,
    pageSize,
    search:     debouncedSearch || undefined,
    segment:    filters.segment    || undefined,
    wilayaCode: filters.wilayaCode || undefined,
    sort:       filters.sort       || undefined,
    riskLevel:  filters.riskLevel  || undefined,
  });

  const customers = query.data?.data  ?? [];
  const total     = query.data?.meta?.total ?? 0;

  const handleFilterChange = (patch: Partial<CustomerFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handleView = React.useCallback(
    (id: string) => router.push(`/${locale}/crm/${id}`),
    [locale, router],
  );

  return (
    <>
      <CustomerFilters  filters={filters}  onChange={handleFilterChange} />
      <QuickFilterChips stats={stats}      filters={filters} onChange={handleFilterChange} />
      <CustomerTable
        customers={customers}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={query.isLoading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onView={handleView}
        onOpenTicket={onOpenTicket}
        onBlacklist={onBlacklist}
      />
    </>
  );
}
