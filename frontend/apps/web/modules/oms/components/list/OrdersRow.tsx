'use client';

import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PhoneOutlinedIcon      from '@mui/icons-material/PhoneOutlined';
import MoreVertIcon           from '@mui/icons-material/MoreVert';
import OpenInNewIcon          from '@mui/icons-material/OpenInNew';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import { useRouter }          from 'next/navigation';
import { useLocale }          from 'next-intl';
import { useEffect, useState } from 'react';
import type { Order }          from '@ferza/shared';
import { formatDZD, getWilayaByCode } from '@ferza/shared';
import { exportOrderToCSV } from '@/modules/oms/utils/exportOrder';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "0661234567" → "+213 0661 234 567" */
function toInternational(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) {
    return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return phone;
}

/** "Mohamed Ben Ali" → "M. Ben Ali" */
function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

/** Left border color by status */
function leftBorderColor(status: Order['status']): string | undefined {
  if (status === 'AwaitingValidation')     return '#d29922';
  if (status === 'DeliveryFailed_Absent')  return '#E91E63';
  if (status === 'ReturnInTransit_Refused') return '#E91E63';
  return undefined;
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ iso }: { iso: string }) {
  const [mins, setMins] = useState(() =>
    Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 60_000)),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMins(Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 60_000)));
    }, 30_000);
    return () => clearInterval(id);
  }, [iso]);

  if (mins === 0) return (
    <Box display="flex" alignItems="center" gap={0.4} mt={0.25}>
      <AccessTimeIcon sx={{ fontSize: 11, color: 'error.main' }} />
      <Typography variant="caption" sx={{ fontSize: 11, color: 'error.main', fontWeight: 600 }}>
        Expiré
      </Typography>
    </Box>
  );

  const hrs = Math.floor(mins / 60);
  const label = hrs > 0 ? `${hrs}h ${mins % 60}min restant` : `${mins} min restant`;
  const isUrgent = mins < 30;

  return (
    <Box display="flex" alignItems="center" gap={0.4} mt={0.25}>
      <AccessTimeIcon sx={{ fontSize: 11, color: isUrgent ? 'error.main' : 'warning.main' }} />
      <Typography
        variant="caption"
        sx={{
          fontSize:   11,
          fontWeight: 500,
          color:      isUrgent ? 'error.main' : 'warning.main',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_CHIP: Record<
  Order['status'],
  { label: string; color: 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default' }
> = {
  Draft:                   { label: 'Brouillon',        color: 'default'  },
  AwaitingValidation:      { label: 'En attente',        color: 'warning'  },
  Confirmed:               { label: 'Confirmée',         color: 'info'     },
  AwaitingPickup:          { label: 'Att. enlèvement',   color: 'info'     },
  HandedToCarrier:         { label: 'Chez carrier',      color: 'primary'  },
  OutForDelivery:          { label: 'En livraison',      color: 'primary'  },
  DeliveredCOD_Confirmed:  { label: 'Livré',             color: 'success'  },
  COD_Remitted:            { label: 'COD remis',         color: 'success'  },
  DeliveryFailed_Absent:   { label: 'Echec livraison',   color: 'error'    },
  ReturnInTransit_Refused: { label: 'Retour refusé',     color: 'error'    },
  LostInTransit:           { label: 'Perdu en transit',  color: 'error'    },
  Returned:                { label: 'Retournée',         color: 'warning'  },
  Cancelled:               { label: 'Annulée',           color: 'default'  },
};

// ─── Carrier cell ──────────────────────────────────────────────────────────────

function CarrierCell({ order }: { order: Order }) {
  if (!order.carrier) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ fontSize: 12 }}>
        —
      </Typography>
    );
  }

  const isDelivered =
    order.status === 'DeliveredCOD_Confirmed' ||
    order.status === 'COD_Remitted';

  const isTracking =
    order.status === 'HandedToCarrier' ||
    order.status === 'OutForDelivery';

  const isFailedAbsent = order.status === 'DeliveryFailed_Absent';
  const isReturnTransit = order.status === 'ReturnInTransit_Refused';

  const returnOutcomeLabel =
    order.returnOutcome === 'resalable' ? '✓ Réintégré en stock' :
    order.returnOutcome === 'resent'    ? '↻ Renvoyé au client'  :
    order.returnOutcome === 'destroyed' ? '⊗ Perte déclarée'     :
    'Stock: quarantaine';

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography
          variant="body2"
          sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}
          noWrap
        >
          {order.carrier}
          {isTracking && ' — TRK-789456 — E...'}
        </Typography>
        {(isTracking || isDelivered) && (
          <Tooltip title="Voir suivi transporteur">
            <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
          </Tooltip>
        )}
      </Box>

      {isDelivered && (
        <Box display="flex" alignItems="center" gap={0.4} mt={0.25}>
          <CheckCircleIcon sx={{ fontSize: 11, color: 'success.main' }} />
          <Typography
            variant="caption"
            sx={{ fontSize: 11, color: 'success.main', fontWeight: 600 }}
          >
            Encaissé: {formatDZD(order.codAmount)}
          </Typography>
        </Box>
      )}

      {order.status === 'Confirmed' && (
        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
          En préparation
        </Typography>
      )}

      {isFailedAbsent && (
        <Typography variant="caption" sx={{ fontSize: 11, color: 'error.main', fontWeight: 600 }}>
          ⊘ Client absent
        </Typography>
      )}

      {isReturnTransit && (
        <Typography variant="caption" sx={{ fontSize: 11, color: 'error.main', fontWeight: 600 }}>
          En transit retour entrepôt
        </Typography>
      )}

      {order.status === 'Returned' && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: order.returnOutcome ? (
              order.returnOutcome === 'resalable' ? 'success.main' :
              order.returnOutcome === 'resent'    ? 'primary.main' :
              'text.disabled'
            ) : 'warning.main',
          }}
        >
          {returnOutcomeLabel}
        </Typography>
      )}

      {order.status === 'Cancelled' && order.autoCancelAt === null && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
          Expire auto (120 min)
        </Typography>
      )}
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  order:      Order;
  isSelected: boolean;
  onToggle:   () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersRow({ order, isSelected, onToggle }: Props) {
  const router  = useRouter();
  const locale  = useLocale();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const borderColor  = leftBorderColor(order.status);
  const customerName = locale === 'ar' ? order.customerNameAr : order.customerNameFr;
  const abbreviated  = abbreviateName(customerName);
  const phone        = toInternational(order.customerPhone);
  const wilayaName   = order.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';
  const wilayaLabel  = order.wilayaCode ? `${wilayaName} (${order.wilayaCode})` : 'N/A';

  const firstItem    = order.items?.[0];
  const productLabel = firstItem
    ? `${locale === 'ar' ? firstItem.nameAr : firstItem.nameFr} ×${firstItem.quantity}`
    : '—';
  const moreItems = (order.items?.length ?? 0) - 1;

  const RETURN_OUTCOME_CHIP: Record<
    NonNullable<Order['returnOutcome']>,
    { label: string; color: 'success' | 'info' | 'default' }
  > = {
    resalable: { label: 'Réintégré',    color: 'success' },
    resent:    { label: 'Renvoyé',      color: 'info'    },
    destroyed: { label: 'Perte décl.',  color: 'default' },
  };

  const chipConfig =
    order.status === 'Returned' && order.returnOutcome
      ? RETURN_OUTCOME_CHIP[order.returnOutcome]
      : STATUS_CHIP[order.status];

  const handleNavigate = () => {
    router.push(`/${locale}/oms/${order.id}`);
  };

  return (
    <TableRow
      hover
      selected={isSelected}
      onClick={handleNavigate}
      sx={{
        cursor:      'pointer',
        borderLeft:  borderColor ? `4px solid ${borderColor}` : '4px solid transparent',
        '&:last-child td': { border: 0 },
        '&.Mui-selected': {
          backgroundColor: 'rgba(13,71,161,0.04)',
          '&:hover':       { backgroundColor: 'rgba(13,71,161,0.07)' },
        },
      }}
    >
      {/* ── Checkbox ─────────────────────────────────────────── */}
      <TableCell padding="checkbox" sx={{ pl: 1.5 }} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={onToggle}
          sx={{ p: 0.5 }}
        />
      </TableCell>

      {/* ── #COMMANDE ─────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          sx={{
            color:      'primary.main',
            fontWeight: 700,
            fontSize:   13,
            fontFamily: 'JetBrains Mono, monospace',
            '&:hover':  { textDecoration: 'underline' },
          }}
        >
          #{order.reference}
        </Typography>
      </TableCell>

      {/* ── CLIENT / TEL ──────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          variant="body2"
          sx={{
            fontSize:      12,
            fontFamily:    'JetBrains Mono, monospace',
            fontWeight:    500,
            letterSpacing: '0.03em',
            whiteSpace:    'nowrap',
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
          {wilayaLabel}
        </Typography>
      </TableCell>

      {/* ── PRODUITS ──────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: 12 }}
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
            whiteSpace: 'nowrap',
          }}
        >
          {formatDZD(order.codAmount)}
        </Typography>
      </TableCell>

      {/* ── STATUT ────────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25 }}>
        <Chip
          label={chipConfig.label}
          color={chipConfig.color}
          size="small"
          sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
        />
        {order.autoCancelAt && order.status === 'AwaitingValidation' && (
          <Countdown iso={order.autoCancelAt} />
        )}
        {order.status === 'Cancelled' && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, display: 'block', mt: 0.25 }}>
            Annulée
          </Typography>
        )}
      </TableCell>

      {/* ── CARRIER ───────────────────────────────────────────── */}
      <TableCell sx={{ py: 1.25, maxWidth: 180 }}>
        <CarrierCell order={order} />
      </TableCell>

      {/* ── ACTIONS ───────────────────────────────────────────── */}
      <TableCell align="center" sx={{ py: 1.25 }} onClick={(e) => e.stopPropagation()}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.25}>
          {/* Eye — navigate to detail */}
          <Tooltip title="Voir les détails">
            <IconButton
              size="small"
              onClick={handleNavigate}
              sx={{ p: 0.6, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Phone */}
          <Tooltip title={`Appeler ${phone}`}>
            <IconButton
              size="small"
              component="a"
              href={`tel:${order.customerPhone}`}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{ p: 0.6, color: 'text.secondary', '&:hover': { color: 'success.main' } }}
            >
              <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* 3-dot menu */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{ p: 0.6, color: 'text.secondary' }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: { minWidth: 148, borderRadius: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
              },
            }}
          >
            <MenuItem
              onClick={() => { setMenuAnchor(null); handleNavigate(); }}
              sx={{ fontSize: 13, py: 0.75 }}
            >
              Voir details
            </MenuItem>
            <MenuItem
              onClick={() => { setMenuAnchor(null); exportOrderToCSV(order); }}
              sx={{ fontSize: 13, py: 0.75 }}
            >
              Exporter
            </MenuItem>
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  );
}
