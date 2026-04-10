'use client';

import * as React from 'react';
import { useCRMCustomers } from '@/modules/crm/hooks/useCRMCustomers';
import BlacklistFilters, { type BlacklistFilterState } from './BlacklistFilters';
import BlacklistTable from './BlacklistTable';
import type { Customer } from '@ferza/shared';

export default function ListeNoireTab() {
  const [filters, setFilters] = React.useState<BlacklistFilterState>({ search: '', motif: '' });

  const query = useCRMCustomers({ blacklisted: true, pageSize: 100 });
  const allCustomers = (query.data?.data ?? []) as Customer[];

  const customers = allCustomers.filter((c) => {
    if (filters.motif && c.blacklistMotif !== filters.motif) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return c.phone.includes(q) || c.nameFr.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <BlacklistFilters filters={filters} onChange={(p) => setFilters((prev) => ({ ...prev, ...p }))} />
      <BlacklistTable customers={customers} loading={query.isLoading} />
    </>
  );
}
