'use client';

import * as React from 'react';
import {
  Box, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WarningIcon from '@mui/icons-material/Warning';
import BlockIcon from '@mui/icons-material/Block';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';

interface Props {
  open: boolean;
  stats: CRMStats | null;
  onClose: () => void;
  onSelectSegment: (segment: string) => void;
}

const SEGMENTS = [
  { key: 'VIP',          label: 'VIP',          icon: <StarIcon />,        color: '#FFD700', countKey: 'vipCount' as const },
  { key: 'Fidèle',       label: 'Fidèle',       icon: <FavoriteIcon />,    color: '#4CAF50', countKey: 'fideleCount' as const },
  { key: 'Nouveau',      label: 'Nouveau',      icon: <FiberNewIcon />,    color: '#2196F3', countKey: 'nouveauCount' as const },
  { key: 'Inactif',      label: 'Inactif',      icon: <PauseCircleIcon />, color: '#9E9E9E', countKey: 'inactifCount' as const },
  { key: 'A risque',     label: 'À risque',     icon: <WarningIcon />,     color: '#FF9800', countKey: 'aRisqueCount' as const },
  { key: 'Liste noire',  label: 'Liste noire',  icon: <BlockIcon />,       color: '#F44336', countKey: 'blacklistedCount' as const },
];

export default function SegmentsDialog({ open, stats, onClose, onSelectSegment }: Props) {
  const total = stats?.totalCustomers ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Segments clients
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {total} clients au total — cliquez sur un segment pour filtrer la liste.
        </Typography>
        <List disablePadding>
          {SEGMENTS.map((seg) => {
            const count = stats?.[seg.countKey] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <ListItemButton
                key={seg.key}
                onClick={() => {
                  onSelectSegment(seg.key);
                  onClose();
                }}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ color: seg.color, minWidth: 36 }}>
                  {seg.icon}
                </ListItemIcon>
                <ListItemText primary={seg.label} />
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={count} size="small" sx={{ fontWeight: 700, minWidth: 40 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
                    {pct}%
                  </Typography>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}
