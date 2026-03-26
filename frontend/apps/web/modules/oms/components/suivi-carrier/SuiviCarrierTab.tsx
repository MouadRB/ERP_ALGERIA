'use client';

import React from 'react';
import { Box, Typography, Skeleton, Alert } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CarrierCard from './Carriercard';
import { useOMSSuivi } from '@/modules/oms/hooks/useOMSSuivi';
import type { CarrierData } from '@/modules/oms/hooks/useOMSSuivi';

/* ── Carrier display order (top 3 in row, Procolis full-width below) ── */

const TOP_CARRIERS = ['Yalidine', 'Maystro', 'Ecotrack'] as const;
const BOTTOM_CARRIER = 'Procolis';

/* ── Props ─────────────────────────────────────────────── */

interface SuiviCarrierTabProps {
  /**
   * Called when user clicks "Voir tous les envois [Carrier]".
   * Parent should switch to the Toutes les commandes tab pre-filtered by carrier.
   */
  onFilterByCarrier: (carrier: string) => void;
}

/* ── Component ─────────────────────────────────────────── */

export default function SuiviCarrierTab({ onFilterByCarrier }: SuiviCarrierTabProps) {
  const { data: response, isLoading, isError } = useOMSSuivi();
  const suivi = response?.data;

  /* Compute average failure rate across connected carriers for warning threshold */
  const avgTeamEchecRate = React.useMemo(() => {
    if (!suivi?.carriers) return 0;
    const connected = Object.values(suivi.carriers).filter((c) => c.connected);
    if (connected.length === 0) return 0;

    let totalEchecs = 0;
    let totalShipments = 0;
    for (const c of connected) {
      totalEchecs += c.echecs;
      totalShipments += c.enTransit + c.livres + c.echecs;
    }
    return totalShipments > 0 ? totalEchecs / totalShipments : 0;
  }, [suivi]);

  /* ── Loading state ─────────────────────────────────── */
  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={320} height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={420} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mt: 2.5 }} />
      </Box>
    );
  }

  /* ── Error state ───────────────────────────────────── */
  if (isError || !suivi) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Impossible de charger les données carriers. Veuillez réessayer.
      </Alert>
    );
  }

  const carriers = suivi.carriers;

  return (
    <Box>
      {/* ── Section header ────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography
          variant="overline"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'text.secondary',
          }}
        >
          CARRIERS ACTIFS — {suivi.totalShipments} ENVOIS EN COURS
        </Typography>
      </Box>

      {/* ── Top 3 carriers: 3-column grid ─────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        {TOP_CARRIERS.map((carrierName) => {
          const carrierData: CarrierData | undefined = carriers[carrierName];
          if (!carrierData) return null;
          return (
            <CarrierCard
              key={carrierName}
              name={carrierName}
              data={carrierData}
              avgTeamEchecRate={avgTeamEchecRate}
              onViewAllShipments={onFilterByCarrier}
            />
          );
        })}
      </Box>

      {/* ── Procolis: full-width card ──────────────────── */}
      {carriers[BOTTOM_CARRIER] && (
        <CarrierCard
          name={BOTTOM_CARRIER}
          data={carriers[BOTTOM_CARRIER]}
          avgTeamEchecRate={avgTeamEchecRate}
          onViewAllShipments={onFilterByCarrier}
        />
      )}
    </Box>
  );
}
