'use client';

import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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
import type { WilayasData } from '../../hooks/useOMSAnalytics';

/* ── Gradient-like color ramp for bars (1st = darkest) ── */
const BAR_COLORS = [
  '#58a6ff', '#58a6ff', '#58a6ff', '#58a6ff', '#58a6ff',
  '#58a6ff', '#58a6ff', '#58a6ff', '#58a6ff', 'rgba(88,166,255,0.15)',
];

/* ── Props ─────────────────────────────────────────────── */
interface WilayasChartProps {
  data: WilayasData;
  periodLabel: string;
}

/* ── Custom tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <Paper elevation={3} sx={{ px: 1.5, py: 1, borderRadius: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
        {item.name} ({item.code})
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
        {item.count} commandes
      </Typography>
    </Paper>
  );
}

/* ── Component ─────────────────────────────────────────── */
export default function WilayasChart({ data, periodLabel }: WilayasChartProps) {
  const theme = useTheme();
  const gridStroke = theme.palette.divider;
  // Format data for recharts horizontal bar: yAxis = wilaya name, xAxis = count
  const chartData = data.data.map((w) => ({
    ...w,
    label: `${w.name} (${w.code})`,
  }));

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          Top 10 Wilayas — {periodLabel}
        </Typography>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 15, left: 5, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#9E9E9E' }}
              tickLine={false}
              axisLine={{ stroke: '#E0E0E0' }}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={100}
              tick={{ fontSize: 10, fill: '#616161' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          pt: 1.5,
          mt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {data.totalWilayasActives} wilayas actives
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          · Livraison COD disponible
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          · Restrictions PIM intégrées
        </Typography>
      </Box>
    </Paper>
  );
}