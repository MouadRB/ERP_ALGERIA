'use client';

import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { CarrierRepartitionData } from '../../hooks/useOMSAnalytics';

/* ── Props ─────────────────────────────────────────────── */
interface CarrierDonutChartProps {
  data: CarrierRepartitionData;
}

/* ── Custom tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const total = item.payload?.total ?? 0;
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
  return (
    <Paper elevation={3} sx={{ px: 1.5, py: 1, borderRadius: 2 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
        {item.name}: {pct}%
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
        {item.value} envois
      </Typography>
    </Paper>
  );
}

/* ── Component ─────────────────────────────────────────── */
export default function CarrierDonutChart({ data }: CarrierDonutChartProps) {
  const totalDonut = data.donut.reduce((s, d) => s + d.value, 0);
  // Augment each slice with total for tooltip percentage calc
  const donutData = data.donut.map((d) => ({ ...d, total: totalDonut }));

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
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
        Répartition par Carrier
      </Typography>

      {/* ── Donut chart ──────────────────────────────── */}
      <Box sx={{ position: 'relative', height: 170, mb: 0.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {donutData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {data.totalEnvoisActifs}
          </Typography>
          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
            envois actifs
          </Typography>
        </Box>
      </Box>

      {/* ── Legend ────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {data.donut.map((d) => (
          <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color }} />
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{d.name}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Delivery rate bars ────────────────────────── */}
      <Box sx={{ mt: 'auto' }}>
        <Typography
          sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 1 }}
        >
          Taux livraison par carrier:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.tauxLivraison.map((c) => (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{ fontSize: 11, color: 'text.secondary', minWidth: 55, flexShrink: 0 }}
              >
                {c.name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={c.taux}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: c.color,
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  minWidth: 30,
                  textAlign: 'right',
                  color: c.taux >= 70 ? '#2ea043' : '#f85149',
                }}
              >
                {c.taux}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}