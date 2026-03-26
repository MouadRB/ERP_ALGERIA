'use client';

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import type { RetourItem, RaisonCategory, EtatReceptionKey } from '@/modules/oms/hooks/useOMSRetours';
import { useReturnAction } from '@/modules/oms/hooks/useReturnAction';

/* ── Color maps from design spec ───────────────────────── */

const RAISON_CHIP_COLOR: Record<RaisonCategory, 'warning' | 'info' | 'error'> = {
  refus_prix:        'warning',
  mauvaise_taille:   'info',
  endommage:         'error',
  absent_x3:         'warning',
  ne_correspond_pas: 'error',
};

const ETAT_CHIP_COLOR: Record<EtatReceptionKey, 'warning' | 'info'> = {
  quarantaine: 'warning',
  transit:     'info',
};

/** Format phone number for display: 0550234111 → +213 0550 234 111 */
function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) {
    return `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return phone;
}

/* ── Props ─────────────────────────────────────────────── */

interface RetoursTableProps {
  retours: RetourItem[];
  isLoading?: boolean;
  onViewOrder:  (orderId: string) => void;
  onSuivre:     (retour: RetourItem) => void;
}

/* ── Skeleton rows ─────────────────────────────────────── */

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i}>
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 7 ? 80 : j === 5 ? 130 : 100} height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/* ── Component ─────────────────────────────────────────── */

export default function RetoursTable({ retours, isLoading, onViewOrder, onSuivre }: RetoursTableProps) {
  const returnAction = useReturnAction();
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Table size="small" sx={{ minWidth: 900 }}>
        {/* ── Header ─────────────────────────────────── */}
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#F8FAFC',
              '& th': {
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'text.secondary',
                textTransform: 'uppercase',
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1.5,
                whiteSpace: 'nowrap',
              },
            }}
          >
            <TableCell>#COMMANDE</TableCell>
            <TableCell>CLIENT</TableCell>
            <TableCell>PRODUIT</TableCell>
            <TableCell>CARRIER</TableCell>
            <TableCell>RAISON RETOUR</TableCell>
            <TableCell>ÉTAT RÉCEPTION</TableCell>
            <TableCell align="right">ACTION</TableCell>
          </TableRow>
        </TableHead>

        {/* ── Body ───────────────────────────────────── */}
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : retours.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Aucun retour en cours.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            retours.map((r) => (
              <TableRow
                key={r.id}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  cursor: 'pointer',
                  '& td': { py: 1.75, fontSize: 13 },
                }}
                onClick={() => onViewOrder(r.orderId)}
              >
                {/* #COMMANDE */}
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'primary.main',
                    }}
                  >
                    {r.orderRef}
                  </Typography>
                </TableCell>

                {/* CLIENT — phone number in monospace */}
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      color: 'text.primary',
                    }}
                  >
                    {formatPhone(r.customerPhone)}
                  </Typography>
                </TableCell>

                {/* PRODUIT — name + qty */}
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
                    {r.produit}
                    {r.produitQty > 1 && (
                      <Typography
                        component="span"
                        sx={{ color: 'text.secondary', fontSize: 12, ml: 0.5 }}
                      >
                        x{r.produitQty}
                      </Typography>
                    )}
                  </Typography>
                </TableCell>

                {/* CARRIER — name + tracking */}
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.primary', whiteSpace: 'nowrap' }}>
                    {r.carrier}{' '}
                    <Typography
                      component="span"
                      sx={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: 'text.secondary',
                      }}
                    >
                      {r.trackingNumber}
                    </Typography>
                  </Typography>
                </TableCell>

                {/* RAISON RETOUR — colored chip */}
                <TableCell>
                  <Chip
                    label={r.raisonRetour}
                    color={RAISON_CHIP_COLOR[r.raisonCategory] ?? 'default'}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: 11,
                      height: 24,
                      maxWidth: 200,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                </TableCell>

                {/* ÉTAT RÉCEPTION — colored chip */}
                <TableCell>
                  <Chip
                    label={r.etatReception}
                    color={ETAT_CHIP_COLOR[r.etatReceptionKey] ?? 'default'}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 11, height: 24 }}
                  />
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="right">
                  {(() => {
                    const isPending =
                      returnAction.isPending &&
                      returnAction.variables?.id === r.orderId;
                    const pendingAction = isPending
                      ? returnAction.variables?.action
                      : null;

                    if (r.etatReceptionKey === 'quarantaine') {
                      return (
                        <Box
                          display="flex"
                          gap={0.5}
                          justifyContent="flex-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={isPending}
                            onClick={() => returnAction.mutate({ id: r.orderId, action: 'reintegrate' })}
                            startIcon={
                              pendingAction === 'reintegrate'
                                ? <CircularProgress size={12} color="inherit" />
                                : undefined
                            }
                            sx={{ textTransform: 'none', fontSize: 11, borderRadius: 1.5 }}
                          >
                            Reintegrer
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={isPending}
                            onClick={() => returnAction.mutate({ id: r.orderId, action: 'resend' })}
                            startIcon={
                              pendingAction === 'resend'
                                ? <CircularProgress size={12} color="inherit" />
                                : undefined
                            }
                            sx={{ textTransform: 'none', fontSize: 11, borderRadius: 1.5 }}
                          >
                            Renvoyer
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={isPending}
                            onClick={() => returnAction.mutate({ id: r.orderId, action: 'declare_loss' })}
                            startIcon={
                              pendingAction === 'declare_loss'
                                ? <CircularProgress size={12} color="inherit" />
                                : undefined
                            }
                            sx={{ textTransform: 'none', fontSize: 11, borderRadius: 1.5 }}
                          >
                            Perte
                          </Button>
                        </Box>
                      );
                    }

                    return (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSuivre(r);
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: 12,
                          borderRadius: 2,
                          px: 1.5,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          '&:hover': {
                            borderColor: 'text.primary',
                            color: 'text.primary',
                          },
                        }}
                      >
                        Suivre
                      </Button>
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
