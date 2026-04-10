'use client';

import { Badge, Tab, Tabs } from '@mui/material';
import type { Customer } from '@ferza/shared';

export type DetailTab = 0 | 1 | 2 | 3 | 4;

interface Props {
  active:   DetailTab;
  onChange: (tab: DetailTab) => void;
  customer: Customer;
  openTicketsCount: number;
}

export default function CRMDetailTabNav({ active, onChange, customer, openTicketsCount }: Props) {
  return (
    <Tabs
      value={active}
      onChange={(_e, v) => onChange(v as DetailTab)}
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label="Profil & Contact" />
      <Tab
        label={
          <Badge badgeContent={customer.totalOrders} color="primary" max={999}>
            Historique Commandes
          </Badge>
        }
      />
      <Tab
        label={
          <Badge badgeContent={openTicketsCount} color="error">
            Tickets & Support
          </Badge>
        }
      />
      <Tab label="Risque & Fraude" />
      <Tab label="Interactions & Notes" />
    </Tabs>
  );
}
