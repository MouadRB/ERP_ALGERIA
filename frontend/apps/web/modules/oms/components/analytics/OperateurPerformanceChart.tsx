'use client';

import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { OperateursData, OperateurRow } from '../../hooks/useOMSAnalytics';

/* ── Bar color ramp based on confirmation rate ─────────── */
function getBarColor(taux: number, avg: number): string {
  if (taux >= avg + 0.10) return '#2ea043'; // excellent — green
  if (taux >= avg)        return '#58a6ff'; // above avg — blue
  if (taux >= avg - 0.10) return '#d29922'; // slightly below — amber
  return '#f85149';                          // significantly below — red
}

/* ── Props ─────────────────────────────────────────────── */
interface OperateurPerformanceChartProps {
  data: OperateursData;
}

/* ── Component ─────────────────────────────────────────── */
export default function OperateurPerformanceChart({ data }: OperateurPerformanceChartProps) {
  const avg = data.teamAvgTauxConfirmation;

  // Find underperformers: taux below (avg - 15 percentage points)
  const underperformers = data.data.filter(
    (op) => op.tauxConfirmation < avg - 0.15,
  );

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
        Performance Opérateurs (7j)
      </Typography>

      {/* Operator rows */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {data.data.map((op, idx) => (
          <OperatorRow
            key={op.name}
            index={idx + 1}
            op={op}
            teamAvg={avg}
            maxAppelees={Math.max(...data.data.map((o) => o.appelees))}
          />
        ))}
      </Box>

      {/* Underperformance warning */}
      {underperformers.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 2,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(210,153,34,0.12)',
            border: '1px solid #d29922',
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
          <Typography sx={{ fontSize: 11, color: 'text.primary', lineHeight: 1.4 }}>
            {underperformers.map((u) => u.name).join(', ')}:{' '}
            taux sous moyenne équipe ({Math.round(avg * 100)}%) — Formation recommandée.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

/* ── Single operator row ───────────────────────────────── */
function OperatorRow({
  index,
  op,
  teamAvg,
  maxAppelees,
}: {
  index: number;
  op: OperateurRow;
  teamAvg: number;
  maxAppelees: number;
}) {
  const barColor = getBarColor(op.tauxConfirmation, teamAvg);
  const pct = Math.round(op.tauxConfirmation * 100);
  const barWidth = maxAppelees > 0 ? (op.appelees / maxAppelees) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Label */}
      <Box sx={{ minWidth: 120, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Opérateur {index} ({op.name})
        </Typography>
      </Box>

      {/* Appelées count */}
      <Typography
        sx={{
          fontSize: 11,
          color: 'text.secondary',
          minWidth: 70,
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        Appelées: {op.appelees}
      </Typography>

      {/* Bar + label */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: barColor,
            minWidth: 95,
            flexShrink: 0,
          }}
        >
          Confirmés: {op.confirmees} ({pct}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={barWidth}
          sx={{
            flex: 1,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: barColor,
            },
          }}
        />
      </Box>
    </Box>
  );
}