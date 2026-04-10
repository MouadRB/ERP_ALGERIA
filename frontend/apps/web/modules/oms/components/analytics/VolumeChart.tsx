'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { VolumeData } from '../../hooks/useOMSAnalytics';

/* ── Series colors ─────────────────────────────────────── */
const COLOR_TOTAL      = '#0D47A1';
const COLOR_CONFIRMEES = '#2E7D32';
const COLOR_LIVREES    = '#FF8A00';

/* ── Props ─────────────────────────────────────────────── */
interface VolumeChartProps {
  data: VolumeData;
}

/* ── Custom tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ px: 1.5, py: 1, borderRadius: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>{label}</Typography>
      {payload.map((entry: any) => (
        <Typography key={entry.dataKey} sx={{ fontSize: 11, color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </Typography>
      ))}
    </Paper>
  );
}

/* ── Component ─────────────────────────────────────────── */
export default function VolumeChart({ data }: VolumeChartProps) {
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
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
        Volume Commandes (30j)
      </Typography>

      {/* Chart */}
      <Box sx={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={COLOR_TOTAL}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="confirmees"
              name="Confirmées"
              stroke={COLOR_CONFIRMEES}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="livrees"
              name="Livrées"
              stroke={COLOR_LIVREES}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Footer stats */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mt: 1.5,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        <FooterStat
          label={`Max: ${data.maxDay.total} commandes (${data.maxDay.date})`}
          highlight
        />
        <FooterStat
          label={`Jour calme: ${data.minDay.total} (${data.minDay.date} → ${data.minDay.label})`}
        />
        <FooterStat
          label={`Croissance 7j: ${data.croissance > 0 ? '+' : ''}${data.croissance}%`}
          color={data.croissance >= 0 ? '#2E7D32' : '#C62828'}
        />
      </Box>
    </Paper>
  );
}

function FooterStat({
  label,
  highlight,
  color,
}: {
  label: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        color: color ?? (highlight ? 'primary.main' : 'text.secondary'),
        fontWeight: highlight ? 700 : 500,
      }}
    >
      {label}
    </Typography>
  );
}