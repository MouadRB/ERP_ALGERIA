'use client';

import {
  Box, Skeleton, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography,
} from '@mui/material';
import type { Customer } from '@ferza/shared';
import CustomerRow from './CustomerRow';

const COLUMNS = [
  { label: 'CLIENT',       width: 220 },
  { label: 'SEGMENT',      width: 110 },
  { label: 'COMMANDES',    width: 130 },
  { label: 'CA TOTAL',     width: 140 },
  { label: 'TX RETOUR',    width: 90  },
  { label: 'RISQUE',       width: 110 },
  { label: 'DERNIÈRE CMD', width: 160 },
  { label: 'ACTIONS',      width: 160 },
];

interface Props {
  customers:    Customer[];
  total:        number;
  page:         number;
  pageSize:     number;
  loading:      boolean;
  onPageChange:     (page: number)     => void;
  onPageSizeChange: (pageSize: number) => void;
  onView:           (id: string)       => void;
  onOpenTicket:     (customer: Customer) => void;
  onBlacklist:      (customer: Customer) => void;
}

export default function CustomerTable({
  customers, total, page, pageSize, loading,
  onPageChange, onPageSizeChange, onView, onOpenTicket, onBlacklist,
}: Props) {
  return (
    <Box>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.label}
                  sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', width: col.width, bgcolor: 'grey.50' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.label}><Skeleton height={40} /></TableCell>
                  ))}
                </TableRow>
              ))
              : customers.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun client trouvé</Typography>
                  </TableCell>
                </TableRow>
              )
              : customers.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  onView={onView}
                  onOpenTicket={onOpenTicket}
                  onBlacklist={onBlacklist}
                />
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_e, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
      />
    </Box>
  );
}
