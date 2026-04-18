'use client';

import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCRMTickets } from '@/modules/crm/hooks/useCRMTickets';
import type { Customer, Ticket, TicketStatus, TicketPriority } from '@ferza/shared';

const STATUS_COLOR: Record<TicketStatus, 'default' | 'primary' | 'warning' | 'error' | 'success' | 'info'> = {
  'Ouvert':           'error',
  'En cours':         'primary',
  'En attente client':'warning',
  'Escaladé':         'error',
  'Résolu':           'success',
  'Fermé':            'default',
};

const PRIORITY_COLOR: Record<TicketPriority, 'default' | 'primary' | 'warning' | 'error'> = {
  'Faible':   'default',
  'Normale':  'primary',
  'Haute':    'warning',
  'Critique': 'error',
};

function relDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  customer:     Customer;
  onNewTicket?: () => void;
}

export default function TicketsSupportTab({ customer, onNewTicket }: Props) {
  const { data, isLoading } = useCRMTickets({ customerId: customer.id, pageSize: 50 });
  const tickets: Ticket[] = data?.data ?? [];

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight={700}>
          Tickets Support ({tickets.length})
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewTicket}
        >
          Ouvrir un Ticket
        </Button>
      </Box>

      {tickets.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Aucun ticket pour ce client</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Priorité</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>
                    <Typography variant="caption" fontFamily="monospace" color="primary.main">
                      {ticket.id}
                    </Typography>
                    {ticket.escalated && (
                      <Chip label="Escaladé" size="small" color="error" sx={{ ml: 0.5, fontSize: 9, height: 16 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{ticket.category}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {ticket.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      size="small"
                      color={STATUS_COLOR[ticket.status]}
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      size="small"
                      color={PRIORITY_COLOR[ticket.priority]}
                      variant="outlined"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{ticket.agentName ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{relDate(ticket.createdAt)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
