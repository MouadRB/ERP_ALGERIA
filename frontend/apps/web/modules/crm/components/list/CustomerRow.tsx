'use client';

import * as React from 'react';
import {
  Avatar, Box, Chip, IconButton, LinearProgress,
  Menu, MenuItem, TableCell, TableRow, Tooltip, Typography,
} from '@mui/material';
import OpenInNewIcon       from '@mui/icons-material/OpenInNew';
import PhoneIcon           from '@mui/icons-material/Phone';
import WhatsAppIcon        from '@mui/icons-material/WhatsApp';
import NoteAddIcon         from '@mui/icons-material/NoteAdd';
import MoreVertIcon        from '@mui/icons-material/MoreVert';
import type { Customer }   from '@ferza/shared';
import { formatDZD, WILAYAS } from '@ferza/shared';
import { SEGMENT_COLOR, SEGMENT_BG, SEGMENT_ICON, RISK_COLOR } from '@/modules/crm/utils/segmentColors';

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7)  return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365)return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} an(s)`;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DeliveredCOD_Confirmed: 'Livré',
    COD_Remitted:           'COD remis',
    Cancelled:              'Annulé',
    AwaitingValidation:     'En attente',
    Confirmed:              'Confirmé',
    AwaitingPickup:         'Prêt pickup',
    HandedToCarrier:        'Carrier',
    OutForDelivery:         'En livraison',
    DeliveryFailed_Absent:  'Échec',
    ReturnInTransit_Refused:'Retour',
    LostInTransit:          'Perdu',
    Returned:               'Retourné',
    Draft:                  'Brouillon',
  };
  return labels[status] ?? status;
}

function getStatusColor(status: string): 'success' | 'error' | 'warning' | 'default' {
  if (['DeliveredCOD_Confirmed', 'COD_Remitted'].includes(status)) return 'success';
  if (['Cancelled', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned', 'DeliveryFailed_Absent'].includes(status)) return 'error';
  if (['AwaitingValidation', 'Confirmed', 'AwaitingPickup'].includes(status)) return 'warning';
  return 'default';
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  customer:     Customer;
  onView:       (id: string) => void;
  onOpenTicket: (customer: Customer) => void;
  onBlacklist:  (customer: Customer) => void;
}

export default function CustomerRow({ customer, onView, onOpenTicket, onBlacklist }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const wilaya    = WILAYAS.find((w) => w.code === customer.wilayaCode);
  const segment   = customer.segment;
  const segColor  = SEGMENT_COLOR[segment] ?? '#8b949e';
  const segBg     = SEGMENT_BG[segment]    ?? '#161b22';
  const segIcon   = SEGMENT_ICON[segment]  ?? '';
  const tauxRetour = customer.tauxRetour ?? 0;
  const fraudScore = customer.fraudScore ?? 0;

  return (
    <TableRow
      hover
      onClick={() => onView(customer.id)}
      sx={{
        cursor: 'pointer',
        bgcolor: customer.blacklisted ? '#FFF5F5' : undefined,
        '&:hover': { bgcolor: customer.blacklisted ? 'rgba(248,81,73,0.12)' : undefined },
      }}
    >
      {/* CLIENT */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: segBg, color: segColor, fontWeight: 700, width: 36, height: 36, fontSize: 13 }}>
            {initials(customer.nameFr)}
          </Avatar>
          <Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
                {customer.nameFr}
              </Typography>
              <Typography variant="caption">{segIcon}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {customer.phone}
            </Typography>
            {wilaya && (
              <Typography variant="caption" color="text.secondary" display="block">{wilaya.name}</Typography>
            )}
          </Box>
        </Box>
      </TableCell>

      {/* SEGMENT */}
      <TableCell>
        <Chip label={segment} size="small" sx={{ bgcolor: segBg, color: segColor, fontWeight: 700, fontSize: 11 }} />
      </TableCell>

      {/* COMMANDES */}
      <TableCell>
        <Typography variant="body2" fontWeight={600}>{customer.totalOrders}</Typography>
        <Typography variant="caption" color="text.secondary">
          {customer.deliveredCount} livrées · {customer.cancelledCount} annulée(s)
        </Typography>
      </TableCell>

      {/* CA TOTAL */}
      <TableCell>
        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
          {formatDZD(customer.totalSpentTTC)}
        </Typography>
        {customer.panierMoyen !== null && (
          <Typography variant="caption" color="text.secondary">Moy: {formatDZD(customer.panierMoyen)}</Typography>
        )}
      </TableCell>

      {/* TX RETOUR */}
      <TableCell>
        <Typography
          variant="body2" fontWeight={700}
          color={tauxRetour > 30 ? 'error.main' : tauxRetour > 15 ? 'warning.main' : 'success.main'}
        >
          {tauxRetour}%
        </Typography>
        <LinearProgress
          variant="determinate" value={Math.min(tauxRetour, 100)}
          color={tauxRetour > 30 ? 'error' : tauxRetour > 15 ? 'warning' : 'success'}
          sx={{ height: 4, borderRadius: 2, width: 60 }}
        />
      </TableCell>

      {/* RISQUE */}
      <TableCell>
        <Chip
          label={customer.riskLevel} size="small"
          sx={{ bgcolor: `${RISK_COLOR[customer.riskLevel]}20`, color: RISK_COLOR[customer.riskLevel], fontWeight: 700, fontSize: 10 }}
        />
        <Typography variant="caption" color="text.secondary" display="block">Score: {fraudScore}/100</Typography>
        <LinearProgress
          variant="determinate" value={fraudScore}
          color={fraudScore > 70 ? 'error' : fraudScore > 40 ? 'warning' : 'success'}
          sx={{ height: 3, borderRadius: 2, width: 60, mt: 0.3 }}
        />
      </TableCell>

      {/* DERNIERE CMD */}
      <TableCell>
        {customer.lastOrderRef ? (
          <Box>
            <Typography variant="caption" fontFamily="monospace" color="primary.main">{customer.lastOrderRef}</Typography>
            {customer.lastOrderStatus && (
              <Chip
                label={getStatusLabel(customer.lastOrderStatus)} size="small"
                color={getStatusColor(customer.lastOrderStatus)}
                sx={{ fontSize: 9, height: 18, ml: 0.5 }}
              />
            )}
            <Typography variant="caption" color="text.secondary" display="block">
              {relativeTime(customer.lastOrderDate)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">—</Typography>
        )}
      </TableCell>

      {/* ACTIONS */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Box display="flex" alignItems="center">
          <Tooltip title="Voir profil">
            <IconButton size="small" onClick={() => onView(customer.id)}><OpenInNewIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Appeler">
            <IconButton size="small" component="a" href={`tel:+213${customer.phone.slice(1)}`}>
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="WhatsApp">
            <IconButton size="small" component="a" href={`https://wa.me/213${customer.phone.slice(1)}`} target="_blank">
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ouvrir ticket">
            <IconButton size="small" onClick={() => onOpenTicket(customer)}><NoteAddIcon fontSize="small" /></IconButton>
          </Tooltip>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); onView(customer.id); }}>Voir profil</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); onOpenTicket(customer); }}>Ouvrir un ticket</MenuItem>
            {!customer.blacklisted && (
              <MenuItem sx={{ color: 'error.main' }} onClick={() => { setAnchorEl(null); onBlacklist(customer); }}>
                Ajouter à la liste noire
              </MenuItem>
            )}
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  );
}
