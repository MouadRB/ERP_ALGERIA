'use client';

import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { formatDZD } from '@ferza/shared';
import type { Customer } from '@ferza/shared';

interface Props { customer: Customer; }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box display="flex" justifyContent="space-between" py={0.5}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" fontWeight={700} fontFamily="monospace">{value}</Typography>
    </Box>
  );
}

export default function StatistiquesCard({ customer }: Props) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          Statistiques
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Stat label="Commandes"    value={String(customer.totalOrders)} />
        <Stat label="Total dépensé" value={formatDZD(customer.totalSpentTTC)} />
        <Stat label="Panier moyen" value={customer.panierMoyen !== null ? formatDZD(customer.panierMoyen) : '—'} />
        <Stat label="Taux retour"  value={customer.tauxRetour !== null ? `${customer.tauxRetour}%` : '—'} />
        <Stat label="Taux annul."  value={customer.tauxAnnulation !== null ? `${customer.tauxAnnulation}%` : '—'} />
        <Stat label="Livrées"      value={String(customer.deliveredCount)} />
        <Stat label="Annulées"     value={String(customer.cancelledCount)} />
        <Stat label="Retournées"   value={String(customer.returnedCount)} />
      </CardContent>
    </Card>
  );
}
