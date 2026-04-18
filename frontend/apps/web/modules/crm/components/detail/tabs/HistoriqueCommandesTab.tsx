'use client';

import { Box, Chip, Divider, Paper, Skeleton, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useOMSOrders } from '@/modules/oms/hooks/useOMSOrders';
import { formatDZD, WILAYAS } from '@ferza/shared';
import type { Customer, Order } from '@ferza/shared';

const DELIVERED_STATUSES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const RETURNED_STATUSES  = ['Returned', 'ReturnInTransit_Refused', 'LostInTransit'];

const STATUS_LABEL: Record<string, string> = {
  DeliveredCOD_Confirmed: 'Livré',
  COD_Remitted:           'COD remis',
  Cancelled:              'Annulé',
  AwaitingValidation:     'En attente',
  Confirmed:              'Confirmé',
  AwaitingPickup:         'Prêt pickup',
  HandedToCarrier:        'Carrier',
  OutForDelivery:         'En livraison',
  DeliveryFailed_Absent:  'Échec livraison',
  ReturnInTransit_Refused:'Retour transit',
  LostInTransit:          'Perdu',
  Returned:               'Retourné',
  Draft:                  'Brouillon',
};

const BORDER_COLOR: Record<string, string> = {
  DeliveredCOD_Confirmed: '#2ea043',
  COD_Remitted:           '#2ea043',
  Cancelled:              '#9E9E9E',
  AwaitingValidation:     '#d29922',
  Confirmed:              '#58a6ff',
  AwaitingPickup:         '#58a6ff',
  HandedToCarrier:        '#bc8cff',
  OutForDelivery:         '#bc8cff',
  DeliveryFailed_Absent:  '#f85149',
  ReturnInTransit_Refused:'#f85149',
  LostInTransit:          '#f85149',
  Returned:               '#f85149',
  Draft:                  '#9E9E9E',
};

function getStatusChipColor(status: string): 'success' | 'error' | 'warning' | 'default' | 'primary' {
  if (DELIVERED_STATUSES.includes(status))   return 'success';
  if (RETURNED_STATUSES.includes(status) || status === 'Cancelled') return 'error';
  if (['AwaitingValidation', 'Confirmed'].includes(status)) return 'warning';
  if (['HandedToCarrier', 'OutForDelivery', 'AwaitingPickup'].includes(status)) return 'primary';
  return 'default';
}

function relDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props { customer: Customer; }

export default function HistoriqueCommandesTab({ customer }: Props) {
  const router = useRouter();
  const locale = (useParams()?.locale as string | undefined) ?? 'fr';

  // Fetch orders via OMS hook with customerId filter (SUBTASK 9 bridge)
  const ordersQuery = useOMSOrders({ customerId: customer.id, pageSize: 100 });
  const orders: Order[] = (ordersQuery.data?.data ?? []) as Order[];

  const delivered  = orders.filter((o) => DELIVERED_STATUSES.includes(o.status));
  const cancelled  = orders.filter((o) => o.status === 'Cancelled');
  const returned   = orders.filter((o) => RETURNED_STATUSES.includes(o.status));
  const totalCA    = delivered.reduce((s, o) => s + (o.totalTTC || 0), 0);

  if (ordersQuery.isLoading) {
    return (
      <Box>{Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 1.5, borderRadius: 1 }} />
      ))}</Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Toutes les commandes ({orders.length})
      </Typography>

      {orders.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Aucune commande pour ce client</Typography>
        </Paper>
      ) : (
        orders.map((order) => {
          const wilaya = WILAYAS.find((w) => w.code === order.wilayaCode);
          const borderColor = BORDER_COLOR[order.status] ?? '#9E9E9E';
          const firstItem   = order.items?.[0];

          return (
            <Paper
              key={order.id}
              variant="outlined"
              sx={{
                mb: 1.5,
                borderLeft: `4px solid ${borderColor}`,
                p: 1.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => router.push(`/${locale}/oms/${order.id}`)}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" fontFamily="monospace" color="primary.main" fontWeight={700}>
                      {order.reference}
                    </Typography>
                    <Chip
                      label={STATUS_LABEL[order.status] ?? order.status}
                      size="small"
                      color={getStatusChipColor(order.status)}
                      sx={{ fontSize: 9, height: 18 }}
                    />
                    {order.source && (
                      <Chip label={order.source} size="small" variant="outlined" sx={{ fontSize: 9, height: 18 }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {relDate(order.createdAt)} · {wilaya?.name ?? order.wilayaCode}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                  {formatDZD(order.totalTTC)}
                </Typography>
              </Box>

              {firstItem && (
                <Box mt={0.8}>
                  <Typography variant="body2" fontWeight={600}>{firstItem.nameFr}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {firstItem.nameAr} · {firstItem.sku} · {firstItem.quantity} × {formatDZD(firstItem.unitPriceTTC)}
                  </Typography>
                </Box>
              )}
              {order.items && order.items.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  +{order.items.length - 1} autre(s) article(s)
                </Typography>
              )}
              {order.carrier && (
                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                  Carrier: {order.carrier}
                  {order.trackingNumber && ` · ${order.trackingNumber}`}
                </Typography>
              )}
              <Typography variant="caption" color="primary.main" display="block" mt={0.3}>
                Voir dans OMS →
              </Typography>
            </Paper>
          );
        })
      )}

      {/* Footer summary */}
      {orders.length > 0 && (
        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 3, flexWrap: 'wrap', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={600}>
            {delivered.length} livrées
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption" fontWeight={600}>
            {cancelled.length} annulée(s)
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption" fontWeight={600}>
            {returned.length} retour(s)
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption" fontWeight={700} color="success.main">
            CA: {formatDZD(totalCA)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
