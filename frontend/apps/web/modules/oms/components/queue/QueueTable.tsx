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
  TableRow,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Order } from '@ferza/shared';
import QueueRow, { computePriority } from './QueueRow';

// ─── Column headers ───────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'checkbox',    label: '',             width: 48,  align: 'center' as const },
  { id: 'priority',   label: 'PRIORITÉ',     width: 72,  align: 'left'   as const },
  { id: 'reference',  label: '#COMMANDE',    width: 140, align: 'left'   as const },
  { id: 'client',     label: 'CLIENT',       width: 180, align: 'left'   as const },
  { id: 'wilaya',     label: 'WILAYA',       width: 100, align: 'left'   as const },
  { id: 'produits',   label: 'PRODUITS',     width: undefined, align: 'left' as const },
  { id: 'montant',    label: 'MONTANT COD',  width: 130, align: 'right'  as const },
  { id: 'temps',      label: 'TEMPS RESTANT',width: 140, align: 'left'   as const },
  { id: 'signaux',    label: 'SIGNAUX',      width: 110, align: 'left'   as const },
  { id: 'actions',    label: 'ACTIONS',      width: 90,  align: 'center' as const },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  orders:      Order[];
  selectedIds: Set<string>;
  onToggle:    (id: string) => void;
  onToggleAll: () => void;
  onConfirm:   (id: string) => void;
  onCancel:    (id: string) => void;
  isLoading:   boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function QueueTable({
  orders,
  selectedIds,
  onToggle,
  onToggleAll,
  onConfirm,
  onCancel,
  isLoading,
}: Props) {
  const allSelected  = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
  const someSelected = orders.some((o) => selectedIds.has(o.id));

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '0 0 8px 8px',
        borderTop:    'none',
        overflow:     'hidden',
      }}
    >
      <TableContainer>
        <Table size="small" stickyHeader>
          {/* ── Head ─────────────────────────────────────────── */}
          <TableHead>
            <TableRow>
              {/* Checkbox header */}
              <TableCell
                padding="checkbox"
                sx={{
                  pl:              1.5,
                  pr:              0,
                  bgcolor:         'action.hover',
                  borderBottom:    '1px solid',
                  borderColor:     'divider',
                  color:           'text.secondary',
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

              {COLUMNS.filter((c) => c.id !== 'checkbox').map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    width:           col.width,
                    bgcolor:         'action.hover',
                    borderBottom:    '1px solid',
                    borderColor:     'divider',
                    py:              1,
                    fontSize:        11,
                    fontWeight:      700,
                    color:           'text.secondary',
                    letterSpacing:   '.06em',
                    whiteSpace:      'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── Body ─────────────────────────────────────────── */}
          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.id} sx={{ py: 1.5 }}>
                      <Skeleton
                        variant="text"
                        width={col.id === 'checkbox' ? 20 : '70%'}
                        height={18}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  align="center"
                  sx={{ py: 8, border: 0 }}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={1}
                  >
                    <AccessTimeIcon
                      sx={{ fontSize: 32, color: 'text.disabled' }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13 }}
                    >
                      Aucune commande en attente de validation.
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontSize: 12 }}
                    >
                      Les nouvelles commandes apparaîtront ici automatiquement.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <QueueRow
                  key={order.id}
                  order={order}
                  priority={computePriority(order)}
                  isSelected={selectedIds.has(order.id)}
                  onToggle={() => onToggle(order.id)}
                  onConfirm={() => onConfirm(order.id)}
                  onCancel={() => onCancel(order.id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}