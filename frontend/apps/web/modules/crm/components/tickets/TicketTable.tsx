'use client';

import {
  Box, Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import type { Ticket } from '@ferza/shared';
import TicketRow from './TicketRow';

const COLUMNS = ['#TICKET', 'CLIENT', 'TYPE', 'STATUT', 'PRIORITÉ', 'COMMANDE LIÉE', 'AGENT', 'DERNIÈRE ACTION', 'ACTIONS'];

interface Props {
  tickets:    Ticket[];
  loading:    boolean;
  openCount:  number;
  escalCount: number;
}

export default function TicketTable({ tickets, loading, openCount, escalCount }: Props) {
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Typography variant="body2" color="text.secondary">
          {openCount} ouverts · {escalCount} escaladés
        </Typography>
      </Box>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', bgcolor: 'grey.50' }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((c) => <TableCell key={c}><Skeleton height={36} /></TableCell>)}
                </TableRow>
              ))
              : tickets.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun ticket</Typography>
                  </TableCell>
                </TableRow>
              )
              : tickets.map((t) => <TicketRow key={t.id} ticket={t} />)
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
