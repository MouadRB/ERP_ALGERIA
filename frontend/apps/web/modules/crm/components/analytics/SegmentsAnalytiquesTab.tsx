'use client';

import * as React from 'react';
import { Box, Chip, Grid, Paper } from '@mui/material';
import { useCRMAnalytics }   from '@/modules/crm/hooks/useCRMAnalytics';
import { useCRMStats }       from '@/modules/crm/hooks/useCRMStats';
import SegmentationDonut     from './SegmentationDonut';
import WilayaDeliveryChart   from './WilayaDeliveryChart';
import ReturnRateChart       from './ReturnRateChart';
import TopClientsTable       from './TopClientsTable';
import InsatisfactionChart   from './InsatisfactionChart';

const PERIODS = [
  { value: '30d',  label: '30 derniers jours' },
  { value: '90d',  label: '90 jours' },
  { value: 'ytd',  label: 'Année en cours' },
];

interface Props {
  onShowVIP?: () => void;
}

export default function SegmentsAnalytiquesTab({ onShowVIP }: Props = {}) {
  const [period, setPeriod] = React.useState('30d');

  const analyticsQuery = useCRMAnalytics(period);
  const statsQuery     = useCRMStats();

  const analytics = analyticsQuery.data?.data;
  const stats     = statsQuery.data?.data;
  const loading   = analyticsQuery.isLoading;

  return (
    <Box>
      {/* Period selector */}
      <Box display="flex" gap={1} mb={3}>
        {PERIODS.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            onClick={() => setPeriod(p.value)}
            variant={period === p.value ? 'filled' : 'outlined'}
            color={period === p.value ? 'primary' : 'default'}
            size="small"
          />
        ))}
      </Box>

      {/* Row 1: Donut + Wilaya + Return Rate */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <SegmentationDonut
              data={analytics?.segmentation ?? []}
              totalClients={stats?.totalCustomers ?? 0}
              loading={loading}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <WilayaDeliveryChart data={analytics?.wilayaDelivery ?? []} loading={loading} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <ReturnRateChart data={analytics?.returnRateWeekly ?? []} loading={loading} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 2: Top Clients + Insatisfaction */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <TopClientsTable
              data={analytics?.topClients ?? []}
              loading={loading}
              vipCount={stats?.vipCount ?? 0}
              onShowVIP={onShowVIP}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <InsatisfactionChart data={analytics?.insatisfactionReasons ?? []} loading={loading} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
