'use client';

import React, { useState } from 'react';
import { Box, Tab, Tabs, Paper } from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HistoryIcon from '@mui/icons-material/History';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import OrderCommandeTab from './tabs/OrderCommandeTab';
import OrderSuiviTab from './tabs/OrderSuiviTab';
import OrderHistoriqueTab from './tabs/OrderHistoriqueTab';
import OrderClientRisqueTab from './tabs/OrderClientRisqueTab';
import OrderPaiementTab from './tabs/OrderPaiementTab';

interface OrderDetailTabsProps { order: any; }

const TAB_CONFIG = [
  { label: 'Commande',       icon: <ReceiptOutlinedIcon /> },
  { label: 'Suivi',          icon: <LocalShippingOutlinedIcon /> },
  { label: 'Historique',     icon: <HistoryIcon /> },
  { label: 'Client+Risque',  icon: <PersonSearchOutlinedIcon /> },
  { label: 'Paiement',       icon: <PaymentOutlinedIcon /> },
];

export default function OrderDetailTabs({ order }: OrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      {/* Tab headers */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              minHeight: 44,
              px: 2,
              gap: 0.75,
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 700,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {TAB_CONFIG.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.label}
              icon={React.cloneElement(tab.icon, { sx: { fontSize: '18px !important' } })}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab content */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          p: 2.5,
          minHeight: 300,
        }}
      >
        {activeTab === 0 && <OrderCommandeTab order={order} />}
        {activeTab === 1 && <OrderSuiviTab order={order} />}
        {activeTab === 2 && <OrderHistoriqueTab order={order} />}
        {activeTab === 3 && <OrderClientRisqueTab order={order} />}
        {activeTab === 4 && <OrderPaiementTab order={order} />}
      </Paper>
    </Box>
  );
}