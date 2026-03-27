'use client';

import * as React from 'react';
import { useCRMTickets } from '@/modules/crm/hooks/useCRMTickets';
import TicketFilters, { type TicketFilterState } from './TicketFilters';
import TicketTable from './TicketTable';
import type { Ticket } from '@ferza/shared';

const DEFAULT_FILTERS: TicketFilterState = { search: '', status: '', category: '', priority: '' };

interface Props {
  initialStatus?: string;
}

export default function FileSupportTab({ initialStatus }: Props) {
  const [filters, setFilters] = React.useState<TicketFilterState>(() => ({
    ...DEFAULT_FILTERS,
    status: initialStatus ?? '',
  }));

  // When initialStatus changes (e.g. clicking alerts), update filter
  React.useEffect(() => {
    if (initialStatus) {
      setFilters((prev) => ({ ...prev, status: initialStatus }));
    }
  }, [initialStatus]);

  const query = useCRMTickets({
    status:   filters.status   || undefined,
    category: filters.category || undefined,
    priority: filters.priority || undefined,
    pageSize: 100,
  });

  const allTickets = (query.data?.data ?? []) as Ticket[];

  // Client-side search filter
  const tickets = filters.search
    ? allTickets.filter((t) =>
        t.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.customerPhone.includes(filters.search) ||
        t.customerNameFr.toLowerCase().includes(filters.search.toLowerCase()),
      )
    : allTickets;

  const openCount  = tickets.filter((t) => ['Ouvert', 'En cours'].includes(t.status)).length;
  const escalCount = tickets.filter((t) => t.escalated).length;

  return (
    <>
      <TicketFilters filters={filters} onChange={(p) => setFilters((prev) => ({ ...prev, ...p }))} />
      <TicketTable
        tickets={tickets}
        loading={query.isLoading}
        openCount={openCount}
        escalCount={escalCount}
      />
    </>
  );
}
