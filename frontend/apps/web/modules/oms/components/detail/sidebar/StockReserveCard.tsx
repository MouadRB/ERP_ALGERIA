'use client';

import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

interface StockReserveCardProps { order: any; }

export default function StockReserveCard({ order }: StockReserveCardProps) {
  const items = order.items ?? [];
  if (items.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, backgroundColor: '#F8FAFC' }}>
        <Typography variant="overline" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
          STOCK RÉSERVÉ
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item: any, idx: number) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 12, color: 'text.primary' }}>
              {item.nameFr} <Typography component="span" sx={{ fontWeight: 700, fontSize: 12 }}>×{item.qty}</Typography>
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}