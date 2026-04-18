'use client';

import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon     from '@mui/icons-material/CancelOutlined';
import CloseIcon              from '@mui/icons-material/Close';
import { useLocale }          from 'next-intl';
import type { Order }         from '@ferza/shared';
import { useConfirmOrder }    from '@/modules/oms/hooks/useConfirmOrder';
import { useCancelOrder }     from '@/modules/oms/hooks/useCancelOrder';
import { useState }           from 'react';
import CancelOrderModal       from '../modals/CancelOrderModal';

// ─── Props ───────────────────────────────────────────────────────────────────

type OperatorActionBarProps = {
  selectedIds:      Set<string>;
  allOrders:        Order[];
  onClearSelection: () => void;
  onConfirmOne:     (id: string) => void;
  onCancelOne:      (id: string) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Sticky action bar that appears at the bottom of the queue section
 * when one or more orders are selected.
 *
 * Single selection  → Confirm + Cancel buttons
 * Multi selection   → Bulk Confirm + Bulk Cancel (each triggers per-order mutations)
 *
 * Bulk operations fire sequentially with a 200ms gap so the BFF
 * is not flooded and the operator can see each state transition.
 */
export default function OperatorActionBar({
  selectedIds,
  allOrders,
  onClearSelection,
  onConfirmOne,
  onCancelOne,
}: OperatorActionBarProps) {
  const locale         = useLocale();
  const confirmOrder   = useConfirmOrder();
  const cancelOrder    = useCancelOrder();
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [bulkReason,     setBulkReason]     = useState('');

  const count          = selectedIds.size;
  const selectedOrders = allOrders.filter((o) => selectedIds.has(o.id));
  const isSingle       = count === 1;
  const singleOrder    = isSingle ? selectedOrders[0] : null;
  const singleName     = singleOrder
    ? (locale === 'ar' ? singleOrder.customerNameAr : singleOrder.customerNameFr)
    : null;

  // ── Bulk confirm — fires one mutation per order sequentially ────────────────
  const handleBulkConfirm = async () => {
    for (const id of Array.from(selectedIds)) {
      await new Promise<void>((resolve) => {
        confirmOrder.mutate(id, {
          onSuccess: () => resolve(),
          onError:   () => resolve(),  // continue even if one fails
        });
      });
      // Small gap — prevents race conditions on the BFF mock array
      await new Promise((r) => setTimeout(r, 200));
    }
    onClearSelection();
  };

  // ── Single cancel — delegates to the modal via prop ────────────────────────
  const handleSingleCancel = () => {
    if (singleOrder) onCancelOne(singleOrder.id);
  };

  // ── Bulk cancel — collects a single reason, fires per-order ────────────────
  const handleBulkCancelConfirm = async () => {
    if (!bulkReason.trim() || bulkReason.trim().length < 5) return;
    for (const id of Array.from(selectedIds)) {
      await new Promise<void>((resolve) => {
        cancelOrder.mutate(
          { id, reason: bulkReason },
          { onSuccess: () => resolve(), onError: () => resolve() },
        );
      });
      await new Promise((r) => setTimeout(r, 200));
    }
    setBulkCancelOpen(false);
    setBulkReason('');
    onClearSelection();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Collapse in={count > 0} timeout={180}>
        <Paper
          elevation={0}
          sx={{
            mt: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.paper',
            px: 2,
            py: 1.25,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            flexWrap="wrap"
          >
            {/* ── Selection summary ──────────────────────────────── */}
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={count}
                size="small"
                color="primary"
                sx={{ fontWeight: 700, height: 20, fontSize: 11 }}
              />
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: 13, color: 'text.primary' }}>
                {isSingle
                  ? `${singleName} sélectionnée`
                  : `${count} commandes sélectionnées`}
              </Typography>
            </Box>

            {/* ── Actions ───────────────────────────────────────── */}
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              {/* Confirm — single or bulk */}
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                disabled={confirmOrder.isPending}
                onClick={
                  isSingle
                    ? () => onConfirmOne(singleOrder!.id)
                    : handleBulkConfirm
                }
                sx={{ fontWeight: 600, fontSize: 12 }}
              >
                {isSingle
                  ? 'Confirmer'
                  : `Confirmer (${count})`}
              </Button>

              {/* Cancel — single delegates to modal, bulk opens inline */}
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                disabled={cancelOrder.isPending}
                onClick={
                  isSingle
                    ? handleSingleCancel
                    : () => setBulkCancelOpen((v) => !v)
                }
                sx={{ fontWeight: 600, fontSize: 12 }}
              >
                {isSingle
                  ? 'Annuler'
                  : `Annuler (${count})`}
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {/* Clear selection */}
              <Button
                size="small"
                color="inherit"
                startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                onClick={onClearSelection}
                sx={{ fontSize: 12, color: 'text.secondary' }}
              >
                Désélectionner
              </Button>
            </Box>
          </Box>

          {/* ── Bulk cancel reason input — expands inline ──────────── */}
          <Collapse in={bulkCancelOpen && !isSingle} timeout={160}>
            <Box mt={1.5} display="flex" gap={1} alignItems="flex-start">
              <Box
                component="textarea"
                value={bulkReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBulkReason(e.target.value)
                }
                placeholder="Raison d'annulation (min. 5 caractères)..."
                rows={2}
                style={{
                  flex: 1,
                  resize: 'none',
                  padding: '8px 10px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid var(--color-border-secondary, rgba(140,140,140,0.5))',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  outline: 'none',
                }}
              />
              <Button
                size="small"
                variant="contained"
                color="error"
                disabled={
                  bulkReason.trim().length < 5 || cancelOrder.isPending
                }
                onClick={handleBulkCancelConfirm}
                sx={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}
              >
                Annuler {count} commandes
              </Button>
            </Box>
          </Collapse>
        </Paper>
      </Collapse>

      {/* CancelOrderModal is used for single order cancel from the bar */}
      {/* It is also rendered in OMSQueueTab — no duplicate here needed */}
    </>
  );
}