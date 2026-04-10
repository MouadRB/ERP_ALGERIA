'use client';

import { Badge, Tab, Tabs } from '@mui/material';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';

export type CrmTab = 0 | 1 | 2 | 3;

interface Props {
  active:   CrmTab;
  onChange: (tab: CrmTab) => void;
  stats:    CRMStats | null;
}

export default function CRMTabNav({ active, onChange, stats }: Props) {
  return (
    <Tabs
      value={active}
      onChange={(_e, v) => onChange(v as CrmTab)}
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab
        label={
          <Badge badgeContent={stats?.totalCustomers ?? 0} color="primary" max={999}>
            Tous les Clients
          </Badge>
        }
      />
      <Tab
        label={
          <Badge badgeContent={stats?.openTicketsCount ?? 0} color="error" max={99}>
            Support & Tickets
          </Badge>
        }
      />
      <Tab
        label={
          <Badge badgeContent={stats?.blacklistedCount ?? 0} color="error">
            Liste Noire
          </Badge>
        }
      />
      <Tab
        label={
          <Badge badgeContent="LIVE" color="success">
            Segments & Analytiques
          </Badge>
        }
      />
    </Tabs>
  );
}
