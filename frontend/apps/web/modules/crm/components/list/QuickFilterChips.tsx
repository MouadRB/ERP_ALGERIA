'use client';

import { Box, Chip } from '@mui/material';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';
import type { CustomerFilterState } from './CustomerFilters';

interface Props {
  stats:    CRMStats | null;
  filters:  CustomerFilterState;
  onChange: (patch: Partial<CustomerFilterState>) => void;
}

export default function QuickFilterChips({ stats, filters, onChange }: Props) {
  const toggle = (segment: string) =>
    onChange({ segment: filters.segment === segment ? '' : segment });

  return (
    <Box display="flex" gap={1} mb={2}>
      <Chip
        label={`VIP ${stats?.vipCount ?? '…'}`}
        onClick={() => toggle('VIP')}
        variant={filters.segment === 'VIP' ? 'filled' : 'outlined'}
        color="warning"
        size="small"
      />
      <Chip
        label={`À risque ${stats?.aRisqueCount ?? '…'}`}
        onClick={() => toggle('A risque')}
        variant={filters.segment === 'A risque' ? 'filled' : 'outlined'}
        color="error"
        size="small"
      />
      <Chip
        label={`Inactifs ${stats?.inactifCount ?? '…'}`}
        onClick={() => toggle('Inactif')}
        variant={filters.segment === 'Inactif' ? 'filled' : 'outlined'}
        color="default"
        size="small"
      />
    </Box>
  );
}
