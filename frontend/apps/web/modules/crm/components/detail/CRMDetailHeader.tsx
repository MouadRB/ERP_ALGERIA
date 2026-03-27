'use client';

import {
  Avatar, Box, Button, Chip, Divider, IconButton,
  Menu, MenuItem, Tooltip, Typography,
} from '@mui/material';
import * as React from 'react';
import PhoneIcon       from '@mui/icons-material/Phone';
import WhatsAppIcon    from '@mui/icons-material/WhatsApp';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BlockIcon       from '@mui/icons-material/Block';
import MoreVertIcon    from '@mui/icons-material/MoreVert';
import type { Customer } from '@ferza/shared';
import { formatDZD, WILAYAS } from '@ferza/shared';
import { SEGMENT_COLOR, SEGMENT_BG, SEGMENT_ICON } from '@/modules/crm/utils/segmentColors';

function relTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days < 7)  return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  customer:    Customer;
  onNewTicket: () => void;
  onBlacklist: () => void;
}

export default function CRMDetailHeader({ customer, onNewTicket, onBlacklist }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const wilaya   = WILAYAS.find((w) => w.code === customer.wilayaCode);
  const segColor = SEGMENT_COLOR[customer.segment] ?? '#757575';
  const segBg    = SEGMENT_BG[customer.segment]    ?? '#F5F5F5';
  const segIcon  = SEGMENT_ICON[customer.segment]  ?? '';
  const phone213 = `213${customer.phone.slice(1)}`;

  return (
    <Box sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
        {/* LEFT: identity */}
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor: segBg, color: segColor, fontWeight: 800, width: 52, height: 52, fontSize: 18 }}>
            {initials(customer.nameFr)}
          </Avatar>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={700}>{customer.nameFr}</Typography>
              <Typography variant="body1">{segIcon}</Typography>
              <Chip label={customer.segment} size="small" sx={{ bgcolor: segBg, color: segColor, fontWeight: 700 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {customer.nameAr}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {customer.phone}
              {customer.phoneSec && ` · ${customer.phoneSec}`}
              {wilaya && ` · ${wilaya.name}`}
              {customer.commune && ` · ${customer.commune}`}
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip label={`Score: ${customer.fraudScore ?? 0}/100`} size="small" variant="outlined" />
              <Typography variant="caption" color="text.disabled">
                Client depuis: {new Date(customer.createdAt).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT: stats + actions */}
        <Box>
          <Box display="flex" gap={3} mb={1} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">Commandes</Typography>
              <Typography variant="body2" fontWeight={700}>{customer.totalOrders} · {customer.deliveredCount} livrées · {customer.cancelledCount} annulée(s)</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">CA total</Typography>
              <Typography variant="body2" fontWeight={700} fontFamily="monospace">{formatDZD(customer.totalSpentTTC)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Taux annulation</Typography>
              <Typography variant="body2" fontWeight={700}>{customer.tauxAnnulation ?? 0}%</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Dernière commande</Typography>
              <Typography variant="body2" fontWeight={700}>{relTime(customer.lastOrderDate)}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button variant="contained" size="small" startIcon={<PhoneIcon />}
              component="a" href={`tel:+${phone213}`}>
              Appeler
            </Button>
            <Button variant="outlined" size="small" startIcon={<WhatsAppIcon />}
              component="a" href={`https://wa.me/${phone213}`} target="_blank">
              WhatsApp
            </Button>
            <Button variant="outlined" size="small" startIcon={<ConfirmationNumberIcon />} onClick={onNewTicket}>
              + Ouvrir Ticket
            </Button>
            {!customer.blacklisted && (
              <Button variant="outlined" color="error" size="small" startIcon={<BlockIcon />} onClick={onBlacklist}>
                Liste noire
              </Button>
            )}
            <Tooltip title="Plus d'actions">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => setAnchorEl(null)}>Modifier le profil</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)}>Exporter les données</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
