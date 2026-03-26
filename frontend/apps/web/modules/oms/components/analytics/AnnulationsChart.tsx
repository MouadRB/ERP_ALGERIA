'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AnnulationsData } from '../../hooks/useOMSAnalytics';

/* ── Props ─────────────────────────────────────────────── */
interface AnnulationsChartProps {
  data: AnnulationsData;
  periodLabel: string;
}

/* ── Custom tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <Paper elevation={3} sx={{ px: 1.5, py: 1, borderRadius: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{item.raison}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
        {item.count} annulations
      </Typography>
    </Paper>
  );
}

function CustomXAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="end"
      fill="#757575"
      fontSize={9}
      transform={`rotate(-20, ${x}, ${y})`}
    >
      {payload?.value ?? ''}
    </text>
  );
}

/* ── Component ─────────────────────────────────────────── */
export default function AnnulationsChart({ data, periodLabel }: AnnulationsChartProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          Raisons Annulation ({periodLabel})
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'JetBrains Mono, monospace',
            color: 'text.secondary',
          }}
        >
          {data.totalAnnulations} annulations
        </Typography>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.data}
            margin={{ top: 5, right: 10, left: -10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis
              dataKey="raison"
              tick={CustomXAxisTick}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
              interval={0}
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
              {data.data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Auto-expire warning */}
      {data.autoExpire > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            mt: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#FFF8E1',
            border: '1px solid #FFE082',
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#F9A825', mt: 0.25, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: '#5D4037', lineHeight: 1.5 }}>
            {data.autoExpire} annulations auto (expiré) = stock libéré automatiquement.
            Chaque annulation auto = opportunité de vente perdue.
            Optimiser: réduire délai de confirmation !
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
