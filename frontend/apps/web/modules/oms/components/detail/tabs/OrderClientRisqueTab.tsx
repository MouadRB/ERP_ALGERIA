'use client';

import React from 'react';
import { Box, Typography, Paper, LinearProgress, Chip, Divider } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getWilayaByCode } from '@ferza/shared';

interface OrderClientRisqueTabProps { order: any; }

const RISK_THEME: Record<string, { bg: string; color: string; label: string }> = {
  LOW:    { bg: 'rgba(46,160,67,0.15)',  color: 'success.main', label: 'Risque faible' },
  MEDIUM: { bg: 'rgba(210,153,34,0.15)', color: 'warning.main', label: 'Risque moyen' },
  HIGH:   { bg: 'rgba(248,81,73,0.15)',  color: 'error.main', label: 'Risque élevé' },
};

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return phone;
}

export default function OrderClientRisqueTab({ order }: OrderClientRisqueTabProps) {
  const c = order.customer;
  if (!c) {
    return <Typography sx={{ color: 'text.secondary', p: 3 }}>Données client non disponibles.</Typography>;
  }

  const risk = RISK_THEME[c.riskLevel] ?? RISK_THEME.LOW;
  const scorePercent = Math.round((c.fraudScore ?? 0) * 100);
  const wilayaName = c.wilayaCode
    ? getWilayaByCode(c.wilayaCode)?.name ?? c.wilaya ?? c.wilayaCode
    : c.wilaya ?? '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Row 1: Profile + Fraud */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        {/* Customer profile */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
            Profil Client
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <InfoRow icon={<PersonOutlineIcon />} label="Nom" value={c.nameFr} bold />
            {c.nameAr && <InfoRow icon={<PersonOutlineIcon />} label="الاسم" value={c.nameAr} />}
            <InfoRow icon={<PhoneOutlinedIcon />} label="Téléphone" value={formatPhone(c.phone)} mono />
            <InfoRow icon={<LocationOnOutlinedIcon />} label="Wilaya" value={`${wilayaName}${c.wilayaCode ? ` (${c.wilayaCode})` : ''}`} />
            <InfoRow icon={<LocationOnOutlinedIcon />} label="Adresse" value={c.address} />
            <InfoRow icon={<ShoppingBagOutlinedIcon />} label="Commandes" value={`${c.orderCount} commande${c.orderCount !== 1 ? 's' : ''}`} />
            {c.lastDelivery && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary', pl: 3 }}>
                Dernière livraison: {new Date(c.lastDelivery).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Fraud / Risk assessment */}
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
            Évaluation Risque
          </Typography>

          {/* Risk badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, backgroundColor: risk.bg, border: `1px solid ${risk.color}` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: risk.color }}>{risk.label}</Typography>
            </Box>
          </Box>

          {/* Fraud score gauge */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Score de fraude</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: risk.color }}>
                {scorePercent}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={scorePercent}
              sx={{ height: 10, borderRadius: 5, backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: risk.color } }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>0% — Sûr</Typography>
              <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>100% — Fraude</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Risk signals */}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
            Signaux de risque
          </Typography>
          {c.riskSignals?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {c.riskSignals.map((s: string, i: number) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <WarningAmberRoundedIcon sx={{ fontSize: 14, color: risk.color }} />
                  <Typography sx={{ fontSize: 12, color: 'text.primary' }}>{s}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography sx={{ fontSize: 12, color: 'success.main' }}>Aucun signal de risque détecté.</Typography>
            </Box>
          )}

          {/* Blacklist */}
          {c.blacklisted && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 2, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(248,81,73,0.15)', border: '1px solid #f85149' }}>
              <BlockIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'error.main' }}>CLIENT BLACKLISTÉ — commandes futures bloquées</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

function InfoRow({ icon, label, value, bold, mono }: { icon: React.ReactNode; label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 16, color: 'text.secondary', mt: 0.25 } })}
      <Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: bold ? 700 : 400, ...(mono && { fontFamily: 'JetBrains Mono, monospace' }) }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
