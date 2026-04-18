'use client';

import {
  Box,
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import type { Order } from '@ferza/shared';
import OrdersRow      from './OrdersRow';

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'cb',       label: '',             width: 48,        align: 'center' as const },
  { id: 'ref',      label: '#COMMANDE',    width: 148,       align: 'left'   as const },
  { id: 'client',   label: 'CLIENT / TEL', width: 190,       align: 'left'   as const },
  { id: 'wilaya',   label: 'WILAYA',       width: 100,       align: 'left'   as const },
  { id: 'produits', label: 'PRODUITS',     width: undefined, align: 'left'   as const },
  { id: 'montant',  label: 'MONTANT COD',  width: 130,       align: 'right'  as const },
  { id: 'statut',   label: 'STATUT',       width: 148,       align: 'left'   as const },
  { id: 'carrier',  label: 'CARRIER',      width: 180,       align: 'left'   as const },
  { id: 'actions',  label: 'ACTIONS',      width: 100,       align: 'center' as const },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  orders:      Order[];
  total:       number;
  page:        number;            // 0-indexed for MUI pagination
  pageSize:    number;
  isLoading:   boolean;
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  isLoading,
  selectedIds,
  onToggleOne,
  onToggleAll,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const allSelected  = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
  const someSelected = orders.some((o) => selectedIds.has(o.id));

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden' }}
    >
      <TableContainer>
        <Table size="small" stickyHeader>
          {/* ── Head ──────────────────────────────────────── */}
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  pl:           1.5,
                  bgcolor:      'action.hover',
                  borderBottom: '1px solid',
                  borderColor:  'divider',
                  color:        'text.secondary',
                }}
              >
                <Checkbox
                  size="small"
                  indeterminate={someSelected && !allSelected}
                  checked={allSelected}
                  onChange={onToggleAll}
                  sx={{ p: 0.5 }}
                />
              </TableCell>

              {COLUMNS.filter((c) => c.id !== 'cb').map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    width:         col.width,
                    bgcolor:       'action.hover',
                    borderBottom:  '1px solid',
                    borderColor:   'divider',
                    py:            1,
                    fontSize:      11,
                    fontWeight:    700,
                    color:         'text.secondary',
                    letterSpacing: '.06em',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── Body ──────────────────────────────────────── */}
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={{ py: 1.5 }}>
                      <Skeleton variant="text" height={18} width={col.id === 'cb' ? 18 : '70%'} />
                      {(col.id === 'client' || col.id === 'statut') && (
                        <Skeleton variant="text" height={14} width="50%" sx={{ mt: 0.5 }} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 8, border: 0 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <SearchOffIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                      Aucune commande ne correspond à vos filtres.
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Essayez d'élargir vos critères de recherche.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrdersRow
                  key={order.id}
                  order={order}
                  isSelected={selectedIds.has(order.id)}
                  onToggle={() => onToggleOne(order.id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ────────────────────────────────────── */}
      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count}`
          }
          labelRowsPerPage="Lignes :"
          sx={{
            borderTop:  '1px solid',
            borderColor: 'divider',
            fontSize:    12,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: 12,
            },
          }}
        />
      )}
    </Paper>
  );
}