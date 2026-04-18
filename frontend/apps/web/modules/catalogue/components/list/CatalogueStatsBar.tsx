'use client';

import {
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

type CatalogueStatsBarProps = {
  stats: {
    draft: number;
    indexed: number;
    masked: number;
    published: number;
    scheduled: number;
    singleChannel: number;
    total: number;
  };
  subtitle: string;
};

const CARDS = [
  { key: 'total', label: 'Tous les canaux', accent: '#2ea043', icon: AutoAwesomeOutlinedIcon },
  { key: 'singleChannel', label: '1 canal seulement', accent: '#d29922', icon: LinkOutlinedIcon },
  { key: 'draft', label: 'En attente publication', accent: '#d29922', icon: WarningAmberOutlinedIcon },
  { key: 'scheduled', label: 'Publication planifiee', accent: '#bc8cff', icon: CampaignOutlinedIcon },
  { key: 'masked', label: 'Masques - rupture', accent: '#f85149', icon: RemoveRedEyeOutlinedIcon },
  { key: 'indexed', label: 'Produits indexes', accent: '#58a6ff', icon: SearchOutlinedIcon },
] as const;

export default function CatalogueStatsBar({ stats, subtitle }: CatalogueStatsBarProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 1.5,
        mb: 2,
      }}
    >
      {CARDS.map((card) => {
        const Icon = card.icon;
        const numberColor = card.key === 'total' ? '#c9d1d9' : card.accent;
        return (
          <Paper
            key={card.key}
            variant="outlined"
            sx={{
              position: 'relative',
              minWidth: 0,
              borderRadius: 4,
              px: 2,
              py: 2.1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderLeft: `3px solid ${card.accent}`,
              boxShadow: 'none',
            }}
          >
            {card.key === 'masked' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  bgcolor: 'error.main',
                }}
              />
            )}
            {card.key === 'indexed' && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ position: 'absolute', top: 12, right: 12 }}
              >
                <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  {subtitle}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  bgcolor: `${card.accent}26`,
                  color: card.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: numberColor, lineHeight: 1.1 }}>
                  {stats[card.key]}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
                  {card.label}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
