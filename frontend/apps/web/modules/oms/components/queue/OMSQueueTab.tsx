'use client';

import {
  Box,
  Button,
  Collapse,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { Order }        from '@ferza/shared';
import { useOMSQueue }       from '@/modules/oms/hooks/useOMSQueue';
import { useConfirmOrder }   from '@/modules/oms/hooks/useConfirmOrder';
import { useCancelOrder }    from '@/modules/oms/hooks/useCancelOrder';
import ModeConfirmationBar, { type SortOption } from './ModeConfirmationBar';
import QueueTable            from './QueueTable';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortOrders(orders: Order[], sort: SortOption): Order[] {
  return [...orders].sort((a, b) => {
    switch (sort) {
      case 'expiration': {
        // Soonest expiry first, null last
        const aMs = a.autoCancelAt
          ? new Date(a.autoCancelAt).getTime()
          : Infinity;
        const bMs = b.autoCancelAt
          ? new Date(b.autoCancelAt).getTime()
          : Infinity;
        return aMs - bMs;
      }
      case 'montant':
        return b.codAmount - a.codAmount;
      case 'wilaya':
        return a.wilayaCode.localeCompare(b.wilayaCode);
      default:
        return 0;
    }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OMSQueueTab() {
  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading } = useOMSQueue();
  const orders: Order[] = (data?.data as Order[] | undefined) ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const confirmOrder = useConfirmOrder();
  const cancelOrder  = useCancelOrder();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sort,        setSort]        = useState<SortOption>('expiration');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Cancel flow state (inline — replaced by modal in Subtask 5)
  const [cancelTarget, setCancelTarget] = useState<'single' | 'bulk' | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason]   = useState('');
  const [cancelError,  setCancelError]    = useState('');

  // ── Sorted orders (client-side) ────────────────────────────────────────────
  const sorted = useMemo(() => sortOrders(orders, sort), [orders, sort]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (orders.every((o) => selectedIds.has(o.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Confirm handlers ───────────────────────────────────────────────────────
  const handleConfirmSingle = (id: string) => {
    confirmOrder.mutate(id);
  };

  const handleConfirmAll = async () => {
    for (const id of Array.from(selectedIds)) {
      await new Promise<void>((resolve) => {
        confirmOrder.mutate(id, {
          onSuccess: () => resolve(),
          onError:   () => resolve(),
        });
      });
    }
    clearSelection();
  };

  // ── Cancel handlers ────────────────────────────────────────────────────────
  const openCancelSingle = (id: string) => {
    setCancelOrderId(id);
    setCancelTarget('single');
    setCancelReason('');
    setCancelError('');
  };

  const openCancelBulk = () => {
    setCancelTarget('bulk');
    setCancelOrderId(null);
    setCancelReason('');
    setCancelError('');
  };

  const handleCancelSubmit = async () => {
    if (cancelReason.trim().length < 5) {
      setCancelError('La raison doit contenir au moins 5 caractères.');
      return;
    }

    if (cancelTarget === 'single' && cancelOrderId) {
      cancelOrder.mutate(
        { id: cancelOrderId, reason: cancelReason },
        {
          onSuccess: () => {
            setCancelTarget(null);
            setCancelOrderId(null);
            setCancelReason('');
          },
        },
      );
    } else if (cancelTarget === 'bulk') {
      for (const id of Array.from(selectedIds)) {
        await new Promise<void>((resolve) => {
          cancelOrder.mutate(
            { id, reason: cancelReason },
            { onSuccess: () => resolve(), onError: () => resolve() },
          );
        });
      }
      setCancelTarget(null);
      setCancelReason('');
      clearSelection();
    }
  };

  const handleCancelDismiss = () => {
    setCancelTarget(null);
    setCancelOrderId(null);
    setCancelReason('');
    setCancelError('');
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Mode Confirmation bar ─────────────────────────── */}
      <ModeConfirmationBar
        total={orders.length}
        selectedCount={selectedIds.size}
        sortValue={sort}
        onSortChange={setSort}
        onConfirmAll={handleConfirmAll}
        onIgnoreAll={clearSelection}
        onCancelAll={openCancelBulk}
        isConfirming={confirmOrder.isPending}
      />

      {/* ── Inline cancel reason panel ────────────────────── */}
      <Collapse in={cancelTarget !== null} timeout={160}>
        <Box
          sx={{
            backgroundColor: 'rgba(248,81,73,0.08)',
            border:          '1px solid #f85149',
            borderTop:       'none',
            px:               2,
            py:               1.5,
            display:          'flex',
            gap:              1.5,
            alignItems:       'flex-start',
            flexWrap:         'wrap',
          }}
        >
          <Box flex={1} minWidth={240}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 11, display: 'block', mb: 0.5 }}
            >
              {cancelTarget === 'bulk'
                ? `Raison d'annulation pour ${selectedIds.size} commande(s) :`
                : "Raison d'annulation :"}
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Saisissez la raison (min. 5 caractères)..."
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                if (cancelError) setCancelError('');
              }}
              error={Boolean(cancelError)}
              helperText={cancelError}
              multiline
              minRows={2}
              sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
            />
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            gap={0.75}
            justifyContent="flex-start"
            pt={2.5}
          >
            <Button
              size="small"
              variant="contained"
              color="error"
              disabled={cancelReason.trim().length < 5 || cancelOrder.isPending}
              onClick={handleCancelSubmit}
              sx={{ fontWeight: 600, fontSize: 12, textTransform: 'none' }}
            >
              {cancelOrder.isPending ? 'Annulation...' : 'Confirmer l\'annulation'}
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={handleCancelDismiss}
              sx={{ fontSize: 12, textTransform: 'none', color: 'text.secondary' }}
            >
              Annuler
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* ── Queue table ───────────────────────────────────── */}
      <QueueTable
        orders={sorted}
        selectedIds={selectedIds}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
        onConfirm={handleConfirmSingle}
        onCancel={openCancelSingle}
        isLoading={isLoading}
      />
    </Box>
  );
}