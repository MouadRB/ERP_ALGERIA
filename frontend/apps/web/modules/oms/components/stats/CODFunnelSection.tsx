'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import type { OMSStats } from '@/modules/oms/hooks/useOMSStats';

// ─── Block config ─────────────────────────────────────────────────────────────

type Block = {
  key:   keyof OMSStats['funnel'];
  label: string;
  bg:    string;
  color: string;
};

const BLOCKS: Block[] = [
  { key: 'recues',     label: 'Reçues',       bg: '#FFF3E0', color: '#E65100' },
  { key: 'confirmees', label: 'Confirmées',    bg: '#E3F2FD', color: '#0D47A1' },
  { key: 'expediees',  label: 'Expédiées',     bg: '#F3E5F5', color: '#4A148C' },
  { key: 'livrees',    label: 'Livrées',       bg: '#E8F5E9', color: '#1B5E20' },
  { key: 'echecs',     label: 'Echecs',        bg: '#FCE4EC', color: '#B71C1C' },
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
            const count   = funnel?.[block.key] ?? 0;
            const isFirst = i === 0;

            return (
              <Box
                key={block.key}
                flex={1}
                sx={{
                  background:   block.bg,
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
                      sx={{ fontSize: 22, color: block.color, lineHeight: 1.1 }}
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
                          color:      block.color,
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
              <RateRow label="Taux confirmation" value={stats.tauxConfirmation} color="#0D47A1" />
              <RateRow label="Taux livraison"    value={stats.tauxLivraison}    color="#1B5E20" />
              <RateRow label="Taux échec"        value={stats.tauxEchec}        color="#C62828" />
              <RateRow label="Taux annulation"   value={stats.tauxAnnulation}   color="#757575" />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}