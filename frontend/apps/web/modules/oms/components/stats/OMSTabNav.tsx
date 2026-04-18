'use client';

import { Box, Tab, Tabs, Typography } from '@mui/material';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import GridViewIcon      from '@mui/icons-material/GridView';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SyncIcon          from '@mui/icons-material/Sync';
import BarChartIcon      from '@mui/icons-material/BarChart';

// ─── Tab type ─────────────────────────────────────────────────────────────────

export type OmsTab =
  | 'file-attente'
  | 'toutes-commandes'
  | 'suivi-carrier'
  | 'retours-litiges'
  | 'analytics';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  active:      OmsTab;
  onChange:    (t: OmsTab) => void;
  queueCount:  number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OMSTabNav({ active, onChange, queueCount }: Props) {
  return (
    <Tabs
      value={active}
      onChange={(_, v: OmsTab) => onChange(v)}
      sx={{
        mb:           2,
        minHeight:    40,
        borderBottom: '1px solid',
        borderColor:  'divider',
        // Remove default MUI indicator — we use the active tab background instead
        '& .MuiTabs-indicator': { display: 'none' },
        '& .MuiTab-root': {
          minHeight:     40,
          py:            0.5,
          px:            1.5,
          mr:            0.5,
          borderRadius:  5,
          fontSize:      13,
          fontWeight:    500,
          color:         'text.secondary',
          textTransform: 'none',
          transition:    'all 0.15s',
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color:           '#fff',
            fontWeight:      700,
          },
          '&:hover:not(.Mui-selected)': {
            backgroundColor: 'action.hover',
            color:           'text.primary',
          },
        },
      }}
    >
      {/* ── File d'attente ───────────────────────────────── */}
      <Tab
        value="file-attente"
        label={
          <Box display="flex" alignItems="center" gap={0.75}>
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            <span>File d'attente</span>
            {queueCount > 0 && (
              <Box
                component="span"
                sx={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  minWidth:        18,
                  height:          18,
                  borderRadius:    '9px',
                  px:              0.6,
                  fontSize:        10,
                  fontWeight:      700,
                  lineHeight:      1,
                  backgroundColor: active === 'file-attente'
                    ? 'rgba(255,255,255,0.25)'
                    : '#d29922',
                  color: active === 'file-attente' ? '#fff' : '#fff',
                }}
              >
                {queueCount}
              </Box>
            )}
          </Box>
        }
      />

      {/* ── Toutes les commandes ──────────────────────────── */}
      <Tab
        value="toutes-commandes"
        label={
          <Box display="flex" alignItems="center" gap={0.75}>
            <GridViewIcon sx={{ fontSize: 14 }} />
            <span>Toutes les commandes</span>
          </Box>
        }
      />

      {/* ── Suivi Carrier ─────────────────────────────────── */}
      <Tab
        value="suivi-carrier"
        label={
          <Box display="flex" alignItems="center" gap={0.75}>
            <LocalShippingIcon sx={{ fontSize: 14 }} />
            <span>Suivi Carrier</span>
          </Box>
        }
      />

      {/* ── Retours & Litiges ─────────────────────────────── */}
      <Tab
        value="retours-litiges"
        label={
          <Box display="flex" alignItems="center" gap={0.75}>
            <SyncIcon sx={{ fontSize: 14 }} />
            <span>Retours & Litiges</span>
          </Box>
        }
      />

      {/* ── Analytics ─────────────────────────────────────── */}
      <Tab
        value="analytics"
        label={
          <Box display="flex" alignItems="center" gap={0.75}>
            <BarChartIcon sx={{ fontSize: 14 }} />
            <span>Analytics</span>
          </Box>
        }
      />
    </Tabs>
  );
}