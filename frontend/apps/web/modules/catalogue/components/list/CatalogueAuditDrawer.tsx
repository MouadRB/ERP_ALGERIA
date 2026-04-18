'use client';

import {
  Box,
  Chip,
  Divider,
  Drawer,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';

type AuditItem = {
  actor: string;
  at: string;
  subtitle: string;
  title: string;
  type: string;
};

type CatalogueAuditDrawerProps = {
  items: AuditItem[];
  onClose: () => void;
  open: boolean;
};

export default function CatalogueAuditDrawer({
  items,
  onClose,
  open,
}: CatalogueAuditDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 360 } } }}
    >
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>
            Journal d'Audit
          </Typography>
          <Chip label="Append-only" size="small" />
        </Stack>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(88,166,255,0.15)',
            color: 'primary.main',
            fontSize: '0.82rem',
          }}
        >
          Conforme Loi 18-07. Hash chain. Retention 10 ans. Aucune suppression possible.
        </Box>

        <Stack spacing={1.5}>
          {items.map((item) => {
            const icon = getAuditIcon(item.type);
            const Icon = icon.component;
            return (
              <Stack key={`${item.at}-${item.title}`} direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    bgcolor: `${icon.color}18`,
                    color: icon.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.3,
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography fontWeight={800}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.subtitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.at).toLocaleString('fr-DZ')} - {item.actor}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>

        <Divider />
        <Typography variant="caption" color="text.secondary">
          Append-only. Hash chain. Conformite Banque d'Algerie.
        </Typography>
      </Stack>
    </Drawer>
  );
}

function getAuditIcon(type: string) {
  switch (type) {
    case 'publish':
      return { component: CheckCircleOutlineOutlinedIcon, color: 'success.main' };
    case 'schedule':
      return { component: EventOutlinedIcon, color: '#bc8cff' };
    case 'mask':
    case 'unpublish':
      return { component: DangerousOutlinedIcon, color: 'error.main' };
    case 'reindex':
      return { component: SyncOutlinedIcon, color: 'primary.main' };
    default:
      return { component: HistoryEduOutlinedIcon, color: 'text.secondary' };
  }
}
