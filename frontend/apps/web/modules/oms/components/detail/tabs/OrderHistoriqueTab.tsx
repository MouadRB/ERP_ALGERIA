'use client';

import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OrderStatusChip from '../../queue/OrderStatusChip';

interface OrderHistoriqueTabProps { order: any; }

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function OrderHistoriqueTab({ order }: OrderHistoriqueTabProps) {
  const history = order.history ?? [];

  if (history.length === 0) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Aucun historique disponible.</Typography>
      </Paper>
    );
  }

  // Show newest first
  const sorted = [...history].reverse();

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, backgroundColor: (t) => t.palette.background.paper, borderBottom: (t) => `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'text.secondary' }}>
          Journal d&apos;audit — {history.length} événement{history.length > 1 ? 's' : ''}
        </Typography>
      </Box>
      <Box>
        {sorted.map((entry: any, idx: number) => (
          <Box key={idx} sx={{ px: 2.5, py: 1.75, borderBottom: idx < sorted.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { backgroundColor: (t) => t.palette.background.paper } }}>
            {/* Timestamp + actor */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'text.secondary' }}>
                {fmtDate(entry.at)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{entry.by}</Typography>
                {entry.role !== 'system' && (
                  <Chip label={entry.role} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, backgroundColor: 'rgba(88,166,255,0.15)', color: 'primary.main', border: '1px solid #58a6ff' }} />
                )}
              </Box>
            </Box>

            {/* State transition */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <OrderStatusChip status={entry.from} size="small" />
              <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <OrderStatusChip status={entry.to} size="small" />
            </Box>

            {/* Reason */}
            {entry.reason && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5, fontStyle: 'italic' }}>
                Raison: {entry.reason}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}