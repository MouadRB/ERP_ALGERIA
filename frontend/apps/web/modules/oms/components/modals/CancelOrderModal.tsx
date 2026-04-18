'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon        from '@mui/icons-material/Close';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useEffect, useState } from 'react';
import { useOMSOrder }   from '@/modules/oms/hooks/useOMSOrder';
import { useCancelOrder } from '@/modules/oms/hooks/useCancelOrder';
import { formatDZD, getWilayaByCode }     from '@ferza/shared';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:    boolean;
  orderId: string;
  onClose: () => void;
};

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 300;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CancelOrderModal({ open, orderId, onClose }: Props) {
  const { data, isLoading } = useOMSOrder(orderId);
  const cancelOrder         = useCancelOrder();
  const order               = data?.data ?? null;
  const wilayaName = order?.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';

  const [reason,      setReason]      = useState('');
  const [touched,     setTouched]     = useState(false);
  const [serverError, setServerError] = useState('');

  // Reset on open
  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
      setServerError('');
      cancelOrder.reset();
    }
  }, [open]);

  const validationError =
    touched && reason.trim().length < MIN_REASON_LENGTH
      ? `La raison doit contenir au moins ${MIN_REASON_LENGTH} caractères.`
      : '';

  const fieldError = serverError || validationError;

  const handleCancel = () => {
    setTouched(true);
    if (reason.trim().length < MIN_REASON_LENGTH) return;

    setServerError('');
    cancelOrder.mutate(
      { id: orderId, reason: reason.trim() },
      {
        onSuccess: () => {
          setTimeout(onClose, 800);
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : 'Une erreur est survenue.';
          setServerError(msg);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      {/* ── Title ─────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          pb:             1.5,
          pt:             2.5,
          px:             3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CancelOutlinedIcon sx={{ fontSize: 20, color: 'error.main' }} />
          <Typography fontWeight={700} fontSize={16}>
            Annuler la commande
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* ── Content ───────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : order ? (
          <Box>
            {/* Order mini-summary */}
            <Box
              sx={{
                border:          '1px solid #f85149',
                borderRadius:    2,
                p:               1.75,
                backgroundColor: 'rgba(248,81,73,0.08)',
                mb:              2.5,
              }}
            >
              <Box display="flex" justifyContent="space-between">
                <Typography
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize:   13,
                    color:      'error.main',
                  }}
                >
                  #{order.reference}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize:   13,
                  }}
                >
                  {formatDZD(order.codAmount)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 12, display: 'block', mt: 0.25 }}
              >
                {order.customerNameFr} - {wilayaName} ({order.wilayaCode})
              </Typography>
            </Box>

            {/* Reason field */}
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={0.5}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ fontSize: 12, color: 'text.primary' }}
                >
                  Raison d'annulation *
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    color: reason.length > MAX_REASON_LENGTH * 0.9
                      ? 'error.main'
                      : 'text.disabled',
                  }}
                >
                  {reason.length}/{MAX_REASON_LENGTH}
                </Typography>
              </Box>

              <TextField
                size="small"
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                placeholder="Ex: Client a demandé l'annulation, adresse incorrecte..."
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_REASON_LENGTH) {
                    setReason(e.target.value);
                    if (serverError) setServerError('');
                  }
                }}
                onBlur={() => setTouched(true)}
                error={Boolean(fieldError)}
                helperText={fieldError}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 },
                  '& .MuiFormHelperText-root': { fontSize: 11, mx: 0, mt: 0.5 },
                }}
              />

              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: 11, display: 'block', mt: 0.75 }}
              >
                Minimum {MIN_REASON_LENGTH} caractères. Cette raison sera
                enregistrée dans l'audit log.
              </Typography>
            </Box>

            {/* Success */}
            {cancelOrder.isSuccess && (
              <Alert severity="success" sx={{ mt: 1.5, fontSize: 12 }}>
                Commande annulée avec succès.
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="error">Commande introuvable.</Alert>
        )}
      </DialogContent>

      <Divider />

      {/* ── Actions ───────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={cancelOrder.isPending}
          sx={{
            textTransform: 'none',
            fontWeight:    500,
            borderRadius:  1.5,
            fontSize:      13,
          }}
        >
          Fermer
        </Button>

        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleCancel}
          disabled={
            isLoading            ||
            !order               ||
            cancelOrder.isPending ||
            cancelOrder.isSuccess
          }
          startIcon={
            cancelOrder.isPending
              ? <CircularProgress size={14} color="inherit" />
              : <CancelOutlinedIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            textTransform: 'none',
            fontWeight:    700,
            borderRadius:  1.5,
            fontSize:      13,
            boxShadow:     'none',
            '&:hover':     { boxShadow: 'none' },
          }}
        >
          {cancelOrder.isPending
            ? 'Annulation...'
            : cancelOrder.isSuccess
            ? 'Annulée ✓'
            : 'Confirmer l\'annulation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
