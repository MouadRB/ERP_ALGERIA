'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface OrderPaiementTabProps { order: any; }

function fmt(v: number): string { return new Intl.NumberFormat('fr-DZ').format(v); }

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrderPaiementTab({ order }: OrderPaiementTabProps) {
  const p = order.paiement;
  if (!p) {
    return <Typography sx={{ color: 'text.secondary', p: 3 }}>Données paiement non disponibles.</Typography>;
  }

  const isRevenueRecognized = !!p.revenueRecognizedAt;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
      {/* Left: Financial breakdown */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
            Détail Financier
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <AmountRow label="Montant HT" value={p.totalHT} />
          <AmountRow label="TVA (19%)" value={p.totalTVA} secondary />
          <Divider />
          <AmountRow label="Total TTC" value={p.totalTTC} bold />
          <Divider />
          <AmountRow label="Montant COD à encaisser" value={p.codAmount} bold primary />
        </Box>
      </Paper>

      {/* Right: Payment status */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PaymentOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
            Statut Paiement
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Payment status */}
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Statut</Typography>
            <Chip
              label={p.paymentStatus}
              size="small"
              color={isRevenueRecognized ? 'success' : 'warning'}
              icon={isRevenueRecognized ? <CheckCircleOutlineIcon /> : <HourglassEmptyIcon />}
              sx={{ fontWeight: 600, fontSize: 12 }}
            />
          </Box>

          {/* Revenue recognition */}
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Reconnaissance revenu</Typography>
            {isRevenueRecognized ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                <Typography sx={{ fontSize: 13, color: '#2E7D32', fontWeight: 600 }}>
                  Reconnu le {fmtDate(p.revenueRecognizedAt)}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1, borderRadius: 2, backgroundColor: '#FFF8E1' }}>
                <HourglassEmptyIcon sx={{ fontSize: 14, color: '#F9A825' }} />
                <Typography sx={{ fontSize: 12, color: '#5D4037' }}>
                  En attente de livraison — revenu non reconnu
                </Typography>
              </Box>
            )}
          </Box>

          {/* Carrier remittance */}
          <Box>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Remise carrier</Typography>
            {p.carrierRemittance ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 12 }}>
                  {p.carrierRemittance.status}
                  {p.carrierRemittance.expectedDate && (
                    <Typography component="span" sx={{ color: 'text.secondary', fontSize: 11, ml: 0.5 }}>
                      (prévu: {new Date(p.carrierRemittance.expectedDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' })})
                    </Typography>
                  )}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>
                Non applicable
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function AmountRow({ label, value, bold, primary, secondary }: { label: string; value: number; bold?: boolean; primary?: boolean; secondary?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 13, color: secondary ? 'text.secondary' : 'text.primary' }}>{label}</Typography>
      <Typography sx={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: bold ? 16 : 13,
        fontWeight: bold ? 800 : 500,
        color: primary ? 'primary.main' : 'text.primary',
      }}>
        {fmt(value)} DZD
      </Typography>
    </Box>
  );
}