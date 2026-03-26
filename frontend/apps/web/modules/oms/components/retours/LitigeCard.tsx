'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import type { LitigeItem, LitigeSeverity } from '@/modules/oms/hooks/useOMSRetours';

/* ── Severity → border & icon color ───────────────────── */

const SEVERITY_THEME: Record<LitigeSeverity, { borderColor: string; iconColor: string; bgColor: string }> = {
  high:   { borderColor: '#C62828', iconColor: '#C62828', bgColor: '#FFF5F5' },
  medium: { borderColor: '#FF8A00', iconColor: '#E65100', bgColor: '#FFFBF5' },
  low:    { borderColor: '#F9A825', iconColor: '#F9A825', bgColor: '#FFFDF5' },
};

/* ── Litige status → chip style ────────────────────────── */

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  attente_carrier: { bg: '#FFF3E0', color: '#E65100' },
  finance_notifie: { bg: '#E3F2FD', color: '#0D47A1' },
  resolu:          { bg: '#E8F5E9', color: '#2E7D32' },
};

/** Format phone for display */
function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) {
    return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return phone;
}

/** Compute relative time string in French */
function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays >= 1) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }
  if (diffHours >= 1) {
    return `il y a ${diffHours}h`;
  }
  return "il y a moins d'une heure";
}

/* ── Props ─────────────────────────────────────────────── */

interface LitigeCardProps {
  litige: LitigeItem;
  onViewOrder: (orderId: string) => void;
  onContact:   (litige: LitigeItem) => void;
}

/* ── Component ─────────────────────────────────────────── */

export default function LitigeCard({ litige, onViewOrder, onContact }: LitigeCardProps) {
  const theme = SEVERITY_THEME[litige.severity] ?? SEVERITY_THEME.medium;
  const statusStyle = STATUS_STYLE[litige.statusKey] ?? STATUS_STYLE.attente_carrier;

  const SeverityIcon = litige.severity === 'high' ? ErrorOutlineIcon : WarningAmberRoundedIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${theme.borderColor}`,
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.bgColor,
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* ── Header: order ref + carrier + tracking ───── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SeverityIcon sx={{ fontSize: 18, color: theme.iconColor }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 14,
              color: 'text.primary',
            }}
          >
            {litige.orderRef} — {litige.carrier}{' '}
            <Typography
              component="span"
              sx={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              {litige.trackingNumber}
            </Typography>
          </Typography>
        </Box>

        {/* ── Description ───────────────────────────── */}
        <Typography
          sx={{
            fontSize: 13,
            color: 'text.primary',
            lineHeight: 1.5,
            mb: 1.5,
          }}
        >
          {litige.description}
        </Typography>

        {/* ── Customer phone + wilaya ────────────────── */}
        <Typography
          sx={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'text.secondary',
            mb: 1,
          }}
        >
          {formatPhone(litige.customerPhone)}
          <Typography component="span" sx={{ mx: 0.75, fontSize: 12 }}>
            ·
          </Typography>
          {litige.wilaya}
        </Typography>

        {/* ── Opened date + status ───────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Ouvert {relativeTime(litige.openedAt)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>·</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: statusStyle.bg,
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: statusStyle.color }}>
              {litige.status}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Action buttons at bottom ─────────────────── */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            '& > *': { flex: 1 },
          }}
        >
          {/* Left button: Voir commande */}
          <Button
            size="small"
            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            onClick={() => onViewOrder(litige.orderId)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              color: 'primary.main',
              borderRadius: 0,
              py: 1.25,
              borderRight: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: '#fff',
              },
            }}
          >
            Voir commande
          </Button>

          {/* Right button: Contacter carrier/client */}
          <Button
            size="small"
            startIcon={<HeadsetMicOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            onClick={() => onContact(litige)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              color: 'text.secondary',
              borderRadius: 0,
              py: 1.25,
              '&:hover': {
                backgroundColor: '#F5F5F5',
                color: 'text.primary',
              },
            }}
          >
            {litige.actionLabel}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}