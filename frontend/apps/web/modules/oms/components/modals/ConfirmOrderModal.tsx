'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import { useEffect }      from 'react';
import { useOMSOrder }    from '@/modules/oms/hooks/useOMSOrder';
import { useConfirmOrder } from '@/modules/oms/hooks/useConfirmOrder';
import { formatDZD, getWilayaByCode }      from '@ferza/shared';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:    boolean;
  orderId: string;
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmOrderModal({ open, orderId, onClose }: Props) {
  const { data, isLoading }  = useOMSOrder(orderId);
  const confirmOrder         = useConfirmOrder();
  const order                = data?.data ?? null;
  const wilayaName = order?.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';

  // Reset mutation state when modal opens
  useEffect(() => {
    if (open) confirmOrder.reset();
  }, [open]);

  const handleConfirm = () => {
    confirmOrder.mutate(orderId, {
      onSuccess: () => {
        setTimeout(onClose, 800);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, p: 0 } }}
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
          <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
          <Typography fontWeight={700} fontSize={16}>
            Confirmer la commande
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
            {/* Order summary card */}
            <Box
              sx={{
                border:          '1px solid',
                borderColor:     'divider',
                borderRadius:    2,
                p:               2,
                backgroundColor: '#F8FAFC',
                mb:              2,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize:   13,
                    color:      'primary.main',
                  }}
                >
                  #{order.reference}
                </Typography>
                <Chip
                  label="En attente"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                />
              </Box>

              <Typography fontWeight={600} fontSize={14} mb={0.25}>
                {order.customerNameFr}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                {order.customerPhone} - {wilayaName} ({order.wilayaCode})
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              {/* Items */}
              {order.items?.map((item, i) => (
                <Box key={i} display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {item.nameFr} ×{item.quantity}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 500 }}>
                    {formatDZD(item.unitPriceTTC * item.quantity)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Montant COD
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize:   15,
                    color:      'text.primary',
                  }}
                >
                  {formatDZD(order.codAmount)}
                </Typography>
              </Box>
            </Box>

            {/* Info note */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12, display: 'block' }}
            >
              En confirmant, la commande passera à l'état{' '}
              <strong>Confirmée</strong> et sera transmise au WMS pour
              préparation.
            </Typography>

            {/* Success state */}
            {confirmOrder.isSuccess && (
              <Alert severity="success" sx={{ mt: 1.5, fontSize: 12 }}>
                Commande confirmée avec succès.
              </Alert>
            )}

            {/* Error state */}
            {confirmOrder.isError && (
              <Alert severity="error" sx={{ mt: 1.5, fontSize: 12 }}>
                Une erreur est survenue. Veuillez réessayer.
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
          disabled={confirmOrder.isPending}
          sx={{
            textTransform: 'none',
            fontWeight:    500,
            borderRadius:  1.5,
            fontSize:      13,
          }}
        >
          Annuler
        </Button>

        <Button
          variant="contained"
          size="small"
          color="success"
          onClick={handleConfirm}
          disabled={
            isLoading          ||
            !order             ||
            confirmOrder.isPending ||
            confirmOrder.isSuccess
          }
          startIcon={
            confirmOrder.isPending
              ? <CircularProgress size={14} color="inherit" />
              : <CheckCircleIcon sx={{ fontSize: 16 }} />
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
          {confirmOrder.isPending
            ? 'Confirmation...'
            : confirmOrder.isSuccess
            ? 'Confirmée ✓'
            : 'Confirmer la commande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
