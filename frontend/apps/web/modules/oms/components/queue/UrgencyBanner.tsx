'use client';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Order } from '@ferza/shared';

type UrgencyBannerProps = {
  urgentOrders: Order[];   // orders with riskLevel === 'HIGH' in the queue
};

/**
 * Fires when at least one AwaitingValidation order has riskLevel HIGH.
 * Shows count, age of the oldest urgent order, and a direct CTA
 * to the first urgent order's detail page.
 */
export default function UrgencyBanner({ urgentOrders }: UrgencyBannerProps) {
  const router = useRouter();
  const locale = useLocale();

  if (urgentOrders.length === 0) return null;

  // ── Age of the oldest urgent order ─────────────────────────────────────────
  const oldestOrder = urgentOrders.reduce((prev, curr) =>
    new Date(curr.createdAt) < new Date(prev.createdAt) ? curr : prev,
  );

  const ageMinutes = Math.floor(
    (Date.now() - new Date(oldestOrder.createdAt).getTime()) / (1000 * 60),
  );

  const ageLabel =
    ageMinutes < 60
      ? `${ageMinutes} min`
      : `${Math.floor(ageMinutes / 60)}h${ageMinutes % 60 > 0 ? ` ${ageMinutes % 60}min` : ''}`;

  // ── Customer name of the oldest urgent order ────────────────────────────────
  const urgentCustomer =
    locale === 'ar'
      ? oldestOrder.customerNameAr
      : oldestOrder.customerNameFr;

  // ── Banner text ─────────────────────────────────────────────────────────────
  const bannerTitle =
    urgentOrders.length === 1
      ? `Commande à risque élevé en attente`
      : `${urgentOrders.length} commandes à risque élevé en attente`;

  const bannerBody =
    urgentOrders.length === 1
      ? `${urgentCustomer} — en attente depuis ${ageLabel}. Score de fraude : ${((oldestOrder.fraudScore ?? 0) * 100).toFixed(0)}%.`
      : `La plus ancienne (${urgentCustomer}) attend depuis ${ageLabel}.`;

  return (
    <Alert
      severity="error"
      icon={<WarningAmberIcon fontSize="small" />}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'error.light',
        alignItems: 'flex-start',
        '& .MuiAlert-message': { width: '100%' },
      }}
      action={
        <Button
          color="error"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', mt: 0.25 }}
          onClick={() =>
            router.push(`/${locale}/oms/${oldestOrder.id}`)
          }
        >
          Traiter maintenant
        </Button>
      }
    >
      <AlertTitle sx={{ fontWeight: 700, mb: 0.25, fontSize: 13 }}>
        {bannerTitle}
      </AlertTitle>
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="body2" color="error.dark" sx={{ fontSize: 12 }}>
          {bannerBody}
        </Typography>
        {urgentOrders.length > 1 && (
          <Typography
            variant="caption"
            color="error.light"
            sx={{
              background: 'rgba(198,40,40,0.08)',
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              fontWeight: 600,
            }}
          >
            +{urgentOrders.length - 1} autre{urgentOrders.length > 2 ? 's' : ''}
          </Typography>
        )}
      </Box>
    </Alert>
  );
}