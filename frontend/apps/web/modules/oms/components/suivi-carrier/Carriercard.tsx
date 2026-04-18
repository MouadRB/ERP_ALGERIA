'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Button,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { CarrierData, CarrierShipment } from '@/modules/oms/hooks/useOMSSuivi';

/* ── Carrier color map (from design-system.md) ─────────── */

const CARRIER_THEME: Record<string, { color: string; bg: string }> = {
  Yalidine: { color: 'primary.main', bg: 'rgba(88,166,255,0.15)'  },
  Maystro:  { color: 'warning.main', bg: 'rgba(210,153,34,0.15)' },
  Ecotrack: { color: 'success.main', bg: 'rgba(46,160,67,0.15)'  },
  Procolis: { color: '#bc8cff', bg: 'rgba(188,140,255,0.15)' },
};

/* ── Shipment status display map ───────────────────────── */

const SHIPMENT_STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  AwaitingPickup:          { label: 'En attente ramassage', color: '#bc8cff', icon: '🟣' },
  HandedToCarrier:         { label: 'Pris en charge',       color: 'primary.main', icon: '🔵' },
  OutForDelivery:          { label: 'En livraison',         color: 'success.main', icon: '🟢' },
  DeliveredCOD_Confirmed:  { label: 'Livré',                color: 'success.main', icon: '✅' },
  COD_Remitted:            { label: 'COD remis',            color: 'success.main', icon: '✅' },
  DeliveryFailed_Absent:   { label: 'Échec — absent',       color: 'error.main', icon: '🔴' },
  ReturnInTransit_Refused: { label: 'Retour en transit',    color: 'warning.main', icon: '🟠' },
  LostInTransit:           { label: 'Perdu en transit',     color: 'error.main', icon: '⚫' },
  Returned:                { label: 'Retourné au dépôt',    color: 'text.secondary', icon: '📦' },
};

/* ── Props ─────────────────────────────────────────────── */

interface CarrierCardProps {
  name: string;
  data: CarrierData;
  /** Average team failure rate across all connected carriers — used for warning threshold */
  avgTeamEchecRate: number;
  /** Callback when "Voir tous les envois" is clicked — switches to Toutes les commandes filtered */
  onViewAllShipments: (carrier: string) => void;
}

/* ── Component ─────────────────────────────────────────── */

export default function CarrierCard({
  name,
  data,
  avgTeamEchecRate,
  onViewAllShipments,
}: CarrierCardProps) {
  const theme = CARRIER_THEME[name] ?? { color: '#546E7A', bg: '#ECEFF1' };
  const totalShipments = data.enTransit + data.livres + data.echecs;
  const echecRate = totalShipments > 0 ? data.echecs / totalShipments : 0;
  const showWarning = data.connected && echecRate > avgTeamEchecRate * 1.5 && echecRate > 0.05;

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalShippingOutlinedIcon sx={{ color: theme.color, fontSize: 22 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {name === 'Yalidine' ? 'Yalidine Express' : name === 'Maystro' ? 'Maystro Delivery' : name}
          </Typography>
        </Box>

        {data.connected ? (
          <Chip
            size="small"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#2ea043',
                  }}
                />
                <span>Connecté</span>
                {data.apiVersion && (
                  <Typography
                    component="span"
                    sx={{ fontSize: 11, color: 'text.secondary', ml: 0.5 }}
                  >
                    API {data.apiVersion}
                  </Typography>
                )}
              </Box>
            }
            sx={{
              backgroundColor: 'rgba(46,160,67,0.15)',
              color: 'success.main',
              border: '1px solid #2ea043',
              fontWeight: 600,
              fontSize: 12,
              height: 26,
            }}
          />
        ) : (
          <Chip
            size="small"
            label="Déconnecté"
            sx={{
              backgroundColor: 'rgba(139,148,158,0.15)',
              color: 'text.secondary',
              border: '1px solid', borderColor: 'divider',
              fontWeight: 600,
              fontSize: 12,
              height: 26,
            }}
          />
        )}
      </Box>

      {/* ── Stat blocks ────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, pb: 2 }}>
        <StatBlock value={data.enTransit} label="en transit" bgColor="rgba(88,166,255,0.15)" textColor="#58a6ff" />
        <StatBlock value={data.livres}    label="livrés"     bgColor="rgba(46,160,67,0.15)" textColor="#2ea043" />
        <StatBlock
          value={data.echecs}
          label={data.connected ? 'échecs' : 'partiel'}
          bgColor={data.connected ? 'rgba(248,81,73,0.15)' : 'rgba(210,153,34,0.15)'}
          textColor={data.connected ? '#f85149' : '#d29922'}
        />
      </Box>

      {/* ── Recent shipments (connected carriers only) ── */}
      {data.connected && data.recentShipments.length > 0 && (
        <Box sx={{ px: 2.5, pb: 1.5 }}>
          <Typography
            variant="overline"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.08em',
              mb: 1,
              display: 'block',
            }}
          >
            ENVOIS RÉCENTS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {data.recentShipments.map((s: CarrierShipment) => {
              const statusInfo = SHIPMENT_STATUS_MAP[s.status] ?? {
                label: s.status,
                color: 'text.secondary',
                icon: '⚪',
              };
              return (
                <Box
                  key={s.trk}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'text.secondary',
                        flexShrink: 0,
                      }}
                    >
                      {s.trk}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'primary.main',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {s.orderRef}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.wilaya}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
                    <Typography sx={{ fontSize: 11 }}>{statusInfo.icon}</Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusInfo.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusInfo.label}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Disconnected carrier note ──────────────────── */}
      {!data.connected && data.note && (
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: (t) => t.palette.background.default,
              border: '1px solid', borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: 14, lineHeight: 1 }}>💡</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.5 }}>
              {data.note}
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── View all shipments button ──────────────────── */}
      {data.connected && (
        <Box sx={{ px: 2.5, pb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => onViewAllShipments(name)}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: theme.color,
                color: theme.color,
                backgroundColor: theme.bg,
              },
            }}
          >
            Voir tous les envois {name} →
          </Button>
        </Box>
      )}

      {/* ── Footer metrics ─────────────────────────────── */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Delivery rate progress bar */}
          {data.tauxLivraison !== null ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  Taux livraison:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: data.tauxLivraison >= 0.7 ? '#2ea043' : '#f85149',
                  }}
                >
                  {Math.round(data.tauxLivraison * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={data.tauxLivraison * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: data.tauxLivraison >= 0.7 ? theme.color : '#f85149',
                  },
                }}
              />
            </Box>
          ) : (
            <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>
              Taux livraison non disponible (API déconnectée)
            </Typography>
          )}

          {/* Secondary stats row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {data.delaiMoyen !== null && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Délai moyen:{' '}
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, color: 'text.primary', fontSize: 12 }}
                >
                  {data.delaiMoyen} jours
                </Typography>
              </Typography>
            )}
            {data.wilayas !== null && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Wilayas:{' '}
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, color: 'text.primary', fontSize: 12 }}
                >
                  {data.wilayas}/48
                </Typography>
              </Typography>
            )}
          </Box>

          {/* ── Warning if high failure rate ────────────── */}
          {showWarning && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                backgroundColor: 'rgba(210,153,34,0.15)',
                border: '1px solid #d29922',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography sx={{ fontSize: 11, color: 'warning.main', fontWeight: 600 }}>
                Taux échec élevé ce mois ({Math.round(echecRate * 100)}%)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

/* ── Stat block sub-component ──────────────────────────── */

function StatBlock({
  value,
  label,
  bgColor,
  textColor,
}: {
  value: number;
  label: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1.5,
        borderRadius: 2,
        backgroundColor: bgColor,
        border: `1px solid ${textColor}`,
      }}
    >
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 800,
          color: textColor,
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{ fontSize: 11, color: textColor, fontWeight: 500, mt: 0.25 }}
      >
        {label}
      </Typography>
    </Box>
  );
}
