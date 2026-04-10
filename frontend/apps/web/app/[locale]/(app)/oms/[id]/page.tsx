'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Typography, Skeleton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useOMSOrder } from '@/modules/oms/hooks/useOMSOrder';
import OrderDetailHeader from '@/modules/oms/components/detail/OrderDetailHeader';
import OrderDetailTabs from '@/modules/oms/components/detail/OrderDetailTabs';
import ResumeCommandeCard from '@/modules/oms/components/detail/sidebar/ResumeCommandeCard';
import ClientRisqueCard from '@/modules/oms/components/detail/sidebar/ClientRisqueCard';
import StockReserveCard from '@/modules/oms/components/detail/sidebar/StockReserveCard';
import ActionRapideCard from '@/modules/oms/components/detail/sidebar/ActionRapideCard';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'fr';
  const orderId = params?.id as string;

  const { data: response, isLoading, isError } = useOMSOrder(orderId);
  const order = response?.data;

  /* ── Loading state ─────────────────────────────────── */
  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Box>
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3, mb: 2 }} />
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  /* ── Error state ───────────────────────────────────── */
  if (isError || !order) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(`/${locale}/oms`)}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}>
          Retour aux commandes
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Commande introuvable ou erreur de chargement.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Breadcrumb ────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/${locale}/oms`)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 13,
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' },
          }}
        >
          Retour aux commandes
        </Button>
      </Box>

      {/* ── Main layout: content + sidebar ────────────── */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Left: header + tabs */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <OrderDetailHeader order={order} />
          <Box sx={{ mt: 2 }}>
            <OrderDetailTabs order={order} />
          </Box>
        </Box>

        {/* Right: sticky sidebar */}
        <Box
          sx={{
            width: 280,
            flexShrink: 0,
            position: 'sticky',
            top: 16,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ResumeCommandeCard order={order} />
            <ClientRisqueCard order={order} />
            <StockReserveCard order={order} />
            {order.status === 'Confirmed' && <ActionRapideCard order={order} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}