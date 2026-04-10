'use client';

import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon     from '@mui/icons-material/CancelOutlined';
import AccessTimeIcon          from '@mui/icons-material/AccessTime';
import { useRouter }           from 'next/navigation';
import { useLocale }           from 'next-intl';
import { useEffect, useState } from 'react';
import type { Order }          from '@ferza/shared';
import { formatDZD, getWilayaByCode } from '@ferza/shared';

// ─── Priority ────────────────────────────────────────────────────────────────

export type Priority = 1 | 2 | 3 | 4;

const PRIORITY_STYLES: Record<
  Priority,
  { bg: string; color: string; label: string }
> = {
  1: { bg: '#FFEBEE', color: '#C62828', label: '1' },
  2: { bg: '#FFF3E0', color: '#E65100', label: '2' },
  3: { bg: '#FFFDE7', color: '#F9A825', label: '3' },
  4: { bg: '#E8F5E9', color: '#2E7D32', label: '4' },
};

export function computePriority(order: Order): Priority {
  const msRemaining = order.autoCancelAt
    ? new Date(order.autoCancelAt).getTime() - Date.now()
    : Infinity;
  const urgentExpiry = msRemaining < 30 * 60 * 1000;

  if (order.riskLevel === 'HIGH' && urgentExpiry) return 1;
  if (order.riskLevel === 'HIGH')                 return 2;
  if (order.riskLevel === 'MEDIUM')               return 3;
  return 4;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 0773456789 → +213 0773 456 789 */
function toInternational(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) {
    return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return phone;
}

/** "Youcef Belkassem" → "Youcef B." */
function abbreviateName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return full;
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last[0].toUpperCase()}.`;
}

// ─── Countdown cell ───────────────────────────────────────────────────────────

function TimeRemaining({ iso }: { iso: string | null }) {
  const [seconds, setSeconds] = useState<number | null>(() => {
    if (!iso) return null;
    return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!iso) return;
    const id = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000)));
    }, 30_000);
    return () => clearInterval(id);
  }, [iso]);

  if (seconds === null) {
    return (
      <Typography variant="caption" color="text.disabled">—</Typography>
    );
  }

  if (seconds === 0) {
    return (
      <Chip
        label="Expiré"
        size="small"
        color="error"
        sx={{ fontWeight: 700, fontSize: 11, height: 20 }}
      />
    );
  }

  const mins = Math.floor(seconds / 60);
  const hrs  = Math.floor(mins / 60);
  const label = hrs > 0
    ? `${hrs}h ${mins % 60}min`
    : `${mins} min restant`;

  const isUrgent = mins < 30;

  return (
    <Box display="flex" alignItems="center" gap={0.4}>
      <AccessTimeIcon
        sx={{ fontSize: 12, color: isUrgent ? 'error.main' : 'warning.main' }}
      />
      <Typography
        variant="caption"
        sx={{
          fontSize:   11,
          fontWeight: 600,
          color:      isUrgent ? 'error.main' : 'warning.main',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  order:      Order;
  priority:   Priority;
  isSelected: boolean;
  onToggle:   () => void;
  onConfirm:  () => void;
  onCancel:   () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function QueueRow({
  order,
  priority,
  isSelected,
  onToggle,
  onConfirm,
  onCancel,
}: Props) {
  const router = useRouter();
  const locale = useLocale();

  const pStyle      = PRIORITY_STYLES[priority];
  const customerName = locale === 'ar' ? order.customerNameAr : order.customerNameFr;
  const abbreviated  = abbreviateName(customerName);
  const phone        = toInternational(order.customerPhone);

  // Wilaya name lookup — wilayaCode "19" → we just display the code
  // Full wilaya names come from @ferza/shared in Subtask 1 (not yet applied)
  // Safe fallback: show code only, updated when shared package is applied
  const wilayaName = order.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';
  const wilayaDisplay = order.wilayaCode
    ? `${wilayaName} (${order.wilayaCode})`
    : 'N/A';

  // First product item + overflow count
  const firstItem   = order.items?.[0];
  const productLabel = firstItem
    ? `${locale === 'ar' ? firstItem.nameAr : firstItem.nameFr} ×${firstItem.quantity}`
    : '—';
  const moreItems = (order.items?.length ?? 0) - 1;

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const tag = (e.target as HTMLElement).tagName;
    if (['INPUT', 'BUTTON', 'SVG', 'PATH'].includes(tag)) return;
    router.push(`/${locale}/oms/${order.id}`);
  };

  return (
    <TableRow
      hover
      selected={isSelected}
      onClick={handleRowClick}
      sx={{
        cursor:          'pointer',
        borderLeft:      '4px solid #FF8A00',
        '&:last-child td, &:last-child th': { border: 0 },
        '&.Mui-selected': {
          backgroundColor: 'rgba(13,71,161,0.04)',
          '&:hover': { backgroundColor: 'rgba(13,71,161,0.07)' },
        },
      }}
    >
      {/* ── Checkbox ─────────────────────────────────────────── */}
      <TableCell padding="checkbox" sx={{ pl: 1.5, pr: 0 }}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          sx={{
            p: 0.5,
            '&.Mui-checked': { color: 'primary.main' },
          }}
        />
      </TableCell>

      {/* ── PRIORITÉ ─────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25, pr: 1 }}>
        <Box
          sx={{
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           22,
            height:          22,
            borderRadius:    '50%',
            backgroundColor: pStyle.bg,
            border:          `1.5px solid ${pStyle.color}`,
          }}
        >
          <Typography
            sx={{
              fontSize:   11,
              fontWeight: 700,
              color:      pStyle.color,
              lineHeight: 1,
            }}
          >
            {pStyle.label}
          </Typography>
        </Box>
      </TableCell>

      {/* ── #COMMANDE ─────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          sx={{
            color:      'primary.main',
            fontWeight: 700,
            fontSize:   13,
            fontFamily: 'JetBrains Mono, monospace',
            cursor:     'pointer',
            '&:hover':  { textDecoration: 'underline' },
          }}
        >
          #{order.reference}
        </Typography>
      </TableCell>

      {/* ── CLIENT ────────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          variant="body2"
          sx={{
            fontSize:   12,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
            letterSpacing: '0.02em',
            color:      'text.primary',
          }}
        >
          {phone}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 11, display: 'block' }}
        >
          {abbreviated}
        </Typography>
      </TableCell>

      {/* ── WILAYA ────────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500 }}
        >
          {wilayaDisplay}
        </Typography>
      </TableCell>

      {/* ── PRODUITS ──────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: 12, color: 'text.primary' }}
          noWrap
        >
          {productLabel}
        </Typography>
        {moreItems > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            +{moreItems} article{moreItems > 1 ? 's' : ''}
          </Typography>
        )}
      </TableCell>

      {/* ── MONTANT COD ───────────────────────────────────────── */}
      <TableCell align="right" sx={{ py: 1.25 }}>
        <Typography
          sx={{
            fontSize:   13,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
            color:      'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {formatDZD(order.codAmount)}
        </Typography>
      </TableCell>

      {/* ── TEMPS RESTANT ─────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <TimeRemaining iso={order.autoCancelAt} />
      </TableCell>

      {/* ── SIGNAUX ───────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Box display="flex" flexDirection="column" gap={0.4}>
          <Chip
            label={
              order.riskLevel === 'HIGH'   ? 'Risque élevé'  :
              order.riskLevel === 'MEDIUM' ? 'Risque moyen'  :
                                             'Risque faible'
            }
            size="small"
            color={
              order.riskLevel === 'HIGH'   ? 'error'   :
              order.riskLevel === 'MEDIUM' ? 'warning' :
                                             'success'
            }
            sx={{ fontWeight: 600, fontSize: 10, height: 20 }}
          />
          {order.fraudScore !== null && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 10 }}
            >
              Score: {(order.fraudScore * 100).toFixed(0)}%
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* ── ACTIONS ───────────────────────────────────────────── */}
      <TableCell align="center" sx={{ py: 1.25 }} onClick={(e) => e.stopPropagation()}>
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title="Confirmer la commande">
            <IconButton
              size="small"
              color="success"
              onClick={onConfirm}
              sx={{
                p:               0.6,
                border:          '1px solid',
                borderColor:     'success.light',
                borderRadius:    1,
                '&:hover': {
                  backgroundColor: 'success.50',
                },
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Annuler la commande">
            <IconButton
              size="small"
              color="error"
              onClick={onCancel}
              sx={{
                p:               0.6,
                border:          '1px solid',
                borderColor:     'error.light',
                borderRadius:    1,
                '&:hover': {
                  backgroundColor: 'error.50',
                },
              }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}
