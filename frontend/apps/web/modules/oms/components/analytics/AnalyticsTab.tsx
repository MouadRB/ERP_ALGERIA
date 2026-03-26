'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Skeleton,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import VolumeChart from '@/modules/oms/components/analytics/VolumeChart';
import OperateurPerformanceChart from '@/modules/oms/components/analytics/OperateurPerformanceChart';
import CarrierDonutChart from '@/modules/oms/components/analytics/CarrierDonutChart';
import WilayasChart from '@/modules/oms/components/analytics/WilayasChart';
import AnnulationsChart from '@/modules/oms/components/analytics/AnnulationsChart';
import {
  useOMSAnalytics,
  PERIOD_OPTIONS,
  type AnalyticsPeriod,
} from '@/modules/oms/hooks/useOMSAnalytics';

/* ── Component ─────────────────────────────────────────── */

export default function AnalyticsTab() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const { data: response, isLoading, isError, isFetching } = useOMSAnalytics(period);
  const analytics = response?.data;

  const currentLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? '7 derniers jours';

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setPeriod(event.target.value as AnalyticsPeriod);
  };

  /* ── Error state ───────────────────────────────────── */
  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Impossible de charger les données analytiques. Veuillez réessayer.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Period selector (top right) ────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
        <Select
          value={period}
          onChange={handlePeriodChange}
          size="small"
          sx={{
            minWidth: 180,
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            '& .MuiSelect-select': { py: 1 },
            // Subtle loading indicator during refetch
            opacity: isFetching ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* ═══════════════════════════════════════════════════
          ROW 1: Volume | Opérateurs | Carrier Donut
          ═══════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        {isLoading || !analytics ? (
          <>
            <ChartSkeleton height={400} />
            <ChartSkeleton height={400} />
            <ChartSkeleton height={400} />
          </>
        ) : (
          <>
            <VolumeChart data={analytics.volume} />
            <OperateurPerformanceChart data={analytics.operateurs} />
            <CarrierDonutChart data={analytics.carrierRepartition} />
          </>
        )}
      </Box>

      {/* ═══════════════════════════════════════════════════
          ROW 2: Top 10 Wilayas | Raisons Annulation
          ═══════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {isLoading || !analytics ? (
          <>
            <ChartSkeleton height={420} />
            <ChartSkeleton height={420} />
          </>
        ) : (
          <>
            <WilayasChart data={analytics.wilayas} periodLabel={currentLabel} />
            <AnnulationsChart data={analytics.annulations} periodLabel={currentLabel} />
          </>
        )}
      </Box>
    </Box>
  );
}

/* ── Skeleton for chart cards ──────────────────────────── */
function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <Skeleton
      variant="rounded"
      height={height}
      sx={{
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.04)',
      }}
    />
  );
}
