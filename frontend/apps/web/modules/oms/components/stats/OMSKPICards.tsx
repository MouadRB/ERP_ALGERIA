'use client';

import {
  Box,
  Card,
  Skeleton,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PhoneInTalkIcon   from '@mui/icons-material/PhoneInTalk';
import Inventory2Icon    from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import SyncProblemIcon   from '@mui/icons-material/SyncProblem';
import HighlightOffIcon  from '@mui/icons-material/HighlightOff';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import type { OMSStats } from '@/modules/oms/hooks/useOMSStats';
import { formatDZD }     from '@ferza/shared';

type AccentToken = 'warning' | 'info' | 'secondary' | 'success' | 'error' | 'neutral';

// ─── Card configuration ───────────────────────────────────────────────────────

type CardConfig = {
  key:    keyof Omit<OMSStats, 'expirentBientot' | 'caLivres' | 'carriersEnLivraison' | 'retoursStock' | 'quarantaine' | 'annulesAuto' | 'annulesManuel' | 'funnel' | 'tauxConfirmation' | 'tauxLivraison' | 'tauxEchec' | 'tauxAnnulation' | 'lastUpdatedAt'>;
  label:  string;
  icon:   React.ReactNode;
  accent: AccentToken;
  detail: (s: OMSStats) => React.ReactNode;
};

const CARDS: CardConfig[] = [
  {
    key:    'confirmer',
    label:  'A confirmer',
    icon:   <PhoneInTalkIcon />,
    accent: 'warning',
    detail: (s) =>
      s.expirentBientot > 0 ? (
        <Box display="flex" alignItems="center" gap={0.4}>
          <AccessTimeIcon sx={{ fontSize: 12, color: 'error.main' }} />
          <Typography variant="caption" color="error.main" fontWeight={600}>
            Expirent bientôt: {s.expirentBientot}
          </Typography>
        </Box>
      ) : (
        <Typography variant="caption" color="success.main" fontWeight={500}>
          Aucune expiration imminente
        </Typography>
      ),
  },
  {
    key:    'confirmes',
    label:  'Confirmés — WMS',
    icon:   <Inventory2Icon />,
    accent: 'info',
    detail: () => (
      <Typography variant="caption" color="text.secondary">
        En préparation
      </Typography>
    ),
  },
  {
    key:    'enLivraison',
    label:  'En livraison',
    icon:   <LocalShippingIcon />,
    accent: 'secondary',
    detail: (s) => (
      <Typography variant="caption" color="text.secondary" noWrap>
        Yalidine: {s.carriersEnLivraison.Yalidine} · Maystro:{' '}
        {s.carriersEnLivraison.Maystro} · Autres: {s.carriersEnLivraison.autres}
      </Typography>
    ),
  },
  {
    key:    'livres',
    label:  'Livrés',
    icon:   <CheckCircleIcon />,
    accent: 'success',
    detail: (s) => (
      <Typography
        variant="caption"
        fontWeight={700}
        color="success.main"
      >
        CA: {formatDZD(s.caLivres)}
      </Typography>
    ),
  },
  {
    key:    'echecs',
    label:  'Echecs + Retours',
    icon:   <SyncProblemIcon />,
    accent: 'error',
    detail: (s) => (
      <Typography variant="caption" color="warning.main">
        Retours stock: +{s.retoursStock} quarantaine
      </Typography>
    ),
  },
  {
    key:    'annules',
    label:  'Annulés',
    icon:   <HighlightOffIcon />,
    accent: 'neutral',
    detail: (s) => (
      <Typography variant="caption" color="text.secondary">
        Auto (expiré): {s.annulesAuto} · Manuel: {s.annulesManuel}
      </Typography>
    ),
  },
];

// ─── Single card ──────────────────────────────────────────────────────────────

function KPICard({
  config,
  stats,
  loading,
}: {
  config:  CardConfig;
  stats:   OMSStats | null;
  loading: boolean;
}) {
  const theme  = useTheme();
  const value  = stats ? (stats[config.key] as number) : null;
  const accent = config.accent === 'neutral'
    ? theme.palette.text.secondary
    : theme.palette[config.accent].main;

  return (
    <Card
      variant="outlined"
      sx={{
        flex:         '1 1 0',
        minWidth:     148,
        borderRadius: 2,
        borderLeft:   `4px solid ${accent}`,
        bgcolor:      'background.paper',
        borderColor:  'divider',
        boxShadow:    'none',
        backgroundImage: 'none',
        px:           2,
        py:           1.75,
      }}
    >
      {/* Icon + value */}
      <Box display="flex" alignItems="flex-start" gap={1.25} mb={0.5}>
        <Box
          sx={{
            width:          36,
            height:         36,
            borderRadius:   1.5,
            bgcolor:        alpha(accent, 0.12),
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            '& svg':        { fontSize: 20, color: accent },
          }}
        >
          {config.icon}
        </Box>

        <Box>
          {loading || value === null ? (
            <Skeleton variant="text" width={48} height={36} />
          ) : (
            <Typography
              fontWeight={700}
              lineHeight={1}
              sx={{
                fontSize:   28,
                color:      accent,
                fontFamily: 'DM Sans, Nunito, sans-serif',
              }}
            >
              {value.toLocaleString('fr-DZ')}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Label */}
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={500}
        sx={{ fontSize: 12, mb: 0.75 }}
      >
        {config.label}
      </Typography>

      {/* Detail */}
      <Box sx={{ minHeight: 18 }}>
        {loading || !stats ? (
          <Skeleton variant="text" width="65%" height={16} />
        ) : (
          config.detail(stats)
        )}
      </Box>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  stats:   OMSStats | null;
  loading: boolean;
};

export default function OMSKPICards({ stats, loading }: Props) {
  return (
    <Box
      display="flex"
      gap={1.5}
      mb={2.5}
      sx={{
        overflowX:                          'auto',
        '&::-webkit-scrollbar':             { height: 4 },
        '&::-webkit-scrollbar-thumb':       { background: 'rgba(0,0,0,0.12)', borderRadius: 2 },
      }}
    >
      {CARDS.map((cfg) => (
        <KPICard key={String(cfg.key)} config={cfg} stats={stats} loading={loading} />
      ))}
    </Box>
  );
}