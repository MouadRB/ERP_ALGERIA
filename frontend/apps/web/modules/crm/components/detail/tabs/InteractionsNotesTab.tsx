'use client';

import {
  Box,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NoteIcon from '@mui/icons-material/Note';
import { useParams } from 'next/navigation';
import { useOMSOrders } from '@/modules/oms/hooks/useOMSOrders';
import { useCRMTickets } from '@/modules/crm/hooks/useCRMTickets';
import type { Order, Ticket } from '@ferza/shared';
import { formatDZD } from '@ferza/shared';

type TimelineEvent =
  | { kind: 'order';  date: string; order:  Order  }
  | { kind: 'ticket'; date: string; ticket: Ticket };

const STATUS_LABEL: Record<string, string> = {
  DeliveredCOD_Confirmed: 'Livré',
  COD_Remitted:           'COD remis',
  Cancelled:              'Annulé',
  AwaitingValidation:     'En attente validation',
  Confirmed:              'Confirmé',
  OutForDelivery:         'En livraison',
  Returned:               'Retourné',
  ReturnInTransit_Refused:'Retour refusé',
  LostInTransit:          'Perdu',
  DeliveryFailed_Absent:  'Échec livraison',
  HandedToCarrier:        'Remis carrier',
  AwaitingPickup:         'Prêt pickup',
  Draft:                  'Brouillon',
};

function relDate(d: string): string {
  const date = new Date(d);
  const now  = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7)  return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrderEvent({ order }: { order: Order }) {
  const firstItem = order.items?.[0];
  const isGood    = ['DeliveredCOD_Confirmed','COD_Remitted'].includes(order.status);
  const isBad     = ['Cancelled','Returned','ReturnInTransit_Refused','LostInTransit'].includes(order.status);
  const borderColor = isGood ? '#2E7D32' : isBad ? '#C62828' : '#1565C0';

  return (
    <Box display="flex" gap={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: `${borderColor}18`, border: `2px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <ShoppingBagIcon sx={{ fontSize: 16, color: borderColor }} />
      </Box>
      <Paper variant="outlined" sx={{ p: 1.5, flex: 1, borderLeft: `3px solid ${borderColor}` }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={0.5}>
          <Box>
            <Typography variant="caption" fontFamily="monospace" color="primary.main" fontWeight={700}>
              {order.reference}
            </Typography>
            <Chip
              label={STATUS_LABEL[order.status] ?? order.status}
              size="small"
              sx={{ ml: 0.8, fontSize: 9, height: 16 }}
            />
          </Box>
          <Typography variant="caption" fontWeight={700} fontFamily="monospace">
            {formatDZD(order.totalTTC)}
          </Typography>
        </Box>
        {firstItem && (
          <Typography variant="caption" color="text.secondary">
            {firstItem.nameFr}
            {order.items && order.items.length > 1 && ` +${order.items.length - 1}`}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

function TicketEvent({ ticket }: { ticket: Ticket }) {
  const isOpen = ['Ouvert','En cours','Escaladé'].includes(ticket.status);
  const color  = isOpen ? '#C62828' : '#2E7D32';

  return (
    <Box display="flex" gap={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: `${color}18`, border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <SupportAgentIcon sx={{ fontSize: 16, color }} />
      </Box>
      <Paper variant="outlined" sx={{ p: 1.5, flex: 1, borderLeft: `3px solid ${color}` }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={0.5}>
          <Typography variant="caption" fontFamily="monospace" color="primary.main" fontWeight={700}>
            {ticket.id}
          </Typography>
          <Chip
            label={ticket.status}
            size="small"
            sx={{ fontSize: 9, height: 16, bgcolor: `${color}18`, color }}
          />
        </Box>
        <Typography variant="caption" fontWeight={600}>{ticket.subject}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">{ticket.category}</Typography>
        {ticket.agentName && (
          <Typography variant="caption" color="text.disabled">Agent: {ticket.agentName}</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default function InteractionsNotesTab() {
  const { id: customerId } = useParams() as { id: string };
  const ordersQ  = useOMSOrders({ customerId, pageSize: 100 });
  const ticketsQ = useCRMTickets({ customerId, pageSize: 50 });

  const isLoading = ordersQ.isLoading || ticketsQ.isLoading;

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} display="flex" gap={1.5} mb={2}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="rectangular" height={72} sx={{ flex: 1, borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    );
  }

  const orders:  Order[]  = (ordersQ.data?.data  ?? []) as Order[];
  const tickets: Ticket[] = ticketsQ.data?.data   ?? [];

  // Merge into unified timeline sorted by date desc
  const events: TimelineEvent[] = [
    ...orders.map((o): TimelineEvent  => ({ kind: 'order',  date: o.createdAt,  order:  o })),
    ...tickets.map((t): TimelineEvent => ({ kind: 'ticket', date: t.createdAt,  ticket: t })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const groups = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const key = new Date(ev.date).toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight={700}>
          Historique des interactions ({events.length})
        </Typography>
        <Chip
          icon={<NoteIcon />}
          label={`${orders.length} cmd · ${tickets.length} tickets`}
          size="small"
          variant="outlined"
        />
      </Box>

      {events.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Aucune interaction pour ce client</Typography>
        </Paper>
      ) : (
        Array.from(groups.entries()).map(([month, evs]) => (
          <Box key={month} mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="capitalize">
                {month}
              </Typography>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.disabled">{evs.length}</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {evs.map((ev) => (
                <Box key={ev.kind === 'order' ? ev.order.id : ev.ticket.id}>
                  <Typography variant="caption" color="text.disabled" display="block" mb={0.4}>
                    {relDate(ev.date)}
                  </Typography>
                  {ev.kind === 'order'
                    ? <OrderEvent  order={ev.order}   />
                    : <TicketEvent ticket={ev.ticket} />
                  }
                </Box>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}
