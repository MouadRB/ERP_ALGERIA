'use client';

import {
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon          from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BarChartIcon     from '@mui/icons-material/BarChart';
import TuneIcon         from '@mui/icons-material/Tune';
import { useEffect, useState } from 'react';

type Props = {
  lastUpdatedAt:    string | null;
  onNewOrder:       () => void;
  onExport:         () => void;
  onAnalytics:      () => void;
  onFiltresAvances: () => void;
};

function useRelativeTime(iso: string | null): string {
  const [label, setLabel] = useState('...');

  useEffect(() => {
    if (!iso) return;

    const tick = () => {
      const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      setLabel(sec < 60 ? `il y a ${sec}s` : `il y a ${Math.floor(sec / 60)}min`);
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [iso]);

  return label;
}

export default function OMSPageHeader({ lastUpdatedAt, onNewOrder, onExport, onAnalytics, onFiltresAvances }: Props) {
  const relTime = useRelativeTime(lastUpdatedAt);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      mb={2.5}
      flexWrap="wrap"
      gap={1.5}
    >
      {/* ── Left ─────────────────────────────────────────────────── */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ fontSize: 22, letterSpacing: '-0.3px', mb: 0.4 }}
        >
          Commandes
        </Typography>

        <Box display="flex" alignItems="center" gap={0.6} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            commandes aujourd'hui · en attente · COD uniquement
          </Typography>
          <Typography variant="caption" color="text.disabled">·</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            Dernière maj: {relTime}
          </Typography>
          <Typography variant="caption" color="text.disabled">·</Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width:           7,
                height:          7,
                borderRadius:    '50%',
                backgroundColor: 'success.main',
                boxShadow:       '0 0 0 2px rgba(46,125,50,0.2)',
              }}
            />
            <Typography
              variant="caption"
              sx={{ fontSize: 12, color: 'success.main', fontWeight: 600 }}
            >
              Temps réel
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Right ────────────────────────────────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        {[
          { icon: <FileDownloadIcon sx={{ fontSize: 15 }} />, label: 'Exporter',         onClick: onExport },
          { icon: <BarChartIcon    sx={{ fontSize: 15 }} />, label: 'Analytiques',       onClick: onAnalytics },
          { icon: <TuneIcon        sx={{ fontSize: 15 }} />, label: 'Filtres avancés',   onClick: onFiltresAvances },
        ].map(({ icon, label, onClick }) => (
          <IconButton
            key={label}
            size="small"
            onClick={onClick}
            sx={{
              border:       '1px solid',
              borderColor:  'divider',
              borderRadius: 1.5,
              px:           1.25,
              py:           0.6,
              gap:          0.5,
              color:        'text.secondary',
              fontSize:     13,
              fontWeight:   500,
              '&:hover':    { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            {icon}
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: 12 }}>
              {label}
            </Typography>
          </IconButton>
        ))}

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onNewOrder}
          sx={{
            fontWeight:      700,
            fontSize:        13,
            px:              2,
            py:              0.9,
            borderRadius:    1.5,
            textTransform:   'none',
            boxShadow:       'none',
            '&:hover':       { boxShadow: 'none' },
          }}
        >
          Nouvelle Commande
        </Button>
      </Box>
    </Box>
  );
}