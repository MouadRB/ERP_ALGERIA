'use client';

import React from 'react';
import { Box, Typography, Paper, Divider, LinearProgress } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BlockIcon from '@mui/icons-material/Block';
import { getWilayaByCode } from '@ferza/shared';

interface ClientRisqueCardProps { order: any; }

const RISK_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  LOW:    { bg: '#E8F5E9', color: '#2E7D32', label: 'Risque faible' },
  MEDIUM: { bg: '#FFF3E0', color: '#E65100', label: 'Risque moyen' },
  HIGH:   { bg: '#FFEBEE', color: '#C62828', label: 'Risque élevé' },
};

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return phone;
}

export default function ClientRisqueCard({ order }: ClientRisqueCardProps) {
  const c = order.customer;
  if (!c) return null;

  const risk = RISK_COLORS[c.riskLevel] ?? RISK_COLORS.LOW;
  const wilayaName = c.wilayaCode
    ? getWilayaByCode(c.wilayaCode)?.name ?? c.wilaya ?? c.wilayaCode
    : c.wilaya ?? '';
  const scorePercent = Math.round((c.fraudScore ?? 0) * 100);

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, backgroundColor: '#F8FAFC' }}>
        <Typography variant="overline" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
          CLIENT + RISQUE
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Risk badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: risk.color }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: risk.color }}>{risk.label}</Typography>
        </Box>

        {/* Customer info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 13 }}>{c.nameFr}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {formatPhone(c.phone)}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {wilayaName}{c.wilayaCode ? ` (${c.wilayaCode})` : ''} - {c.orderCount} commande{c.orderCount !== 1 ? 's' : ''} precedente{c.orderCount !== 1 ? 's' : ''}
        </Typography>

        {/* Fraud score gauge */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Score fraude</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: risk.color }}>
              {scorePercent}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={scorePercent}
            sx={{ height: 6, borderRadius: 3, backgroundColor: '#F0F0F0',
              '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: risk.color } }} />
        </Box>

        {/* Risk signals */}
        {c.riskSignals?.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
            {c.riskSignals.map((s: string, i: number) => (
              <Typography key={i} sx={{ fontSize: 11, color: 'text.secondary', pl: 1, borderLeft: `2px solid ${risk.color}` }}>
                {s}
              </Typography>
            ))}
          </Box>
        )}

        {/* Blacklist */}
        {c.blacklisted && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, p: 1, borderRadius: 1.5, backgroundColor: '#FFEBEE' }}>
            <BlockIcon sx={{ fontSize: 14, color: '#C62828' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C62828' }}>CLIENT BLACKLISTÉ</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
