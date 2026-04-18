'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { OMSStats } from '@/modules/oms/hooks/useOMSStats';

// ─── Block config ─────────────────────────────────────────────────────────────

type Block = {
  key:   keyof OMSStats['funnel'];
  label: string;
  token: 'warning' | 'info' | 'secondary' | 'success' | 'error';
};

const BLOCKS: Block[] = [
  { key: 'recues',     label: 'Reçues',     token: 'warning'   },
  { key: 'confirmees', label: 'Confirmées', token: 'info'      },
  { key: 'expediees',  label: 'Expédiées',  token: 'secondary' },
  { key: 'livrees',    label: 'Livrées',    token: 'success'   },
  { key: 'echecs',     label: 'Echecs',     token: 'error'     },
];

// ─── Rate row ─────────────────────────────────────────────────────────────────

function RateRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>
        {label}:
      </Typography>
      <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12, color }}>
        {Math.round(value * 100)}%
      </Typography>
    </Box>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  stats:   OMSStats | null;
  loading: boolean;
};

export default function CODFunnelSection({ stats, loading }: Props) {
  const theme  = useTheme();
  const funnel = stats?.funnel;
  const base   = funnel?.recues ?? 1;

  const pct = (n: number) => `${Math.round((n / base) * 100)}%`;

  return (
    <Box
      mb={2.5}
      sx={{
        border:       '1px solid',
        borderColor:  'divider',
        borderRadius: 2,
        p:            2,
        backgroundColor: 'background.paper',
      }}
    >
      {/* Title */}
      <Typography
        sx={{
          fontSize:      10,
          fontWeight:    700,
          color:         'text.disabled',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          display:       'block',
          mb:            1.5,
        }}
      >
        ENTONNOIR COD — AUJOURD'HUI
      </Typography>

      <Box display="flex" gap={1.5} alignItems="stretch">
        {/* 5 funnel blocks */}
        <Box display="flex" flex={1} gap={0.75} minWidth={0}>
          {BLOCKS.map((block, i) => {
            const count       = funnel?.[block.key] ?? 0;
            const isFirst     = i === 0;
            const blockColor  = theme.palette[block.token].main;

            return (
              <Box
                key={block.key}
                flex={1}
                sx={{
                  bgcolor:      alpha(blockColor, 0.12),
                  border:       '1px solid',
                  borderColor:  alpha(blockColor, 0.4),
                  borderRadius: 1.5,
                  p:            1.25,
                  minWidth:     0,
                  textAlign:    'center',
                }}
              >
                {loading ? (
                  <>
                    <Skeleton variant="text" width="55%" sx={{ mx: 'auto' }} height={30} />
                    <Skeleton variant="text" width="45%" sx={{ mx: 'auto' }} height={16} />
                  </>
                ) : (
                  <>
                    <Typography
                      fontWeight={700}
                      sx={{ fontSize: 22, color: blockColor, lineHeight: 1.1 }}
                    >
                      {count.toLocaleString('fr-DZ')}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 11, color: 'text.secondary', display: 'block', mt: 0.25 }}
                    >
                      {block.label}
                    </Typography>
                    {!isFirst && funnel && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize:   10,
                          color:      blockColor,
                          fontWeight: 600,
                          display:    'block',
                          mt:         0.25,
                        }}
                      >
                        {pct(count)}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Conversion rates sidebar */}
        <Box
          sx={{
            flexShrink:     0,
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
            gap:            0.75,
            pl:             1.75,
            borderLeft:     '1px solid',
            borderColor:    'divider',
            minWidth:       148,
          }}
        >
          {loading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={130} height={16} />
            ))
          ) : (
            <>
              <RateRow label="Taux confirmation" value={stats.tauxConfirmation} color={theme.palette.info.main} />
              <RateRow label="Taux livraison"    value={stats.tauxLivraison}    color={theme.palette.success.main} />
              <RateRow label="Taux échec"        value={stats.tauxEchec}        color={theme.palette.error.main} />
              <RateRow label="Taux annulation"   value={stats.tauxAnnulation}   color={theme.palette.text.secondary} />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}