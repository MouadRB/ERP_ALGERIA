'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

type QuarantineModalProps = {
  open: boolean;
  sku: string | null;
  onClose: () => void;
  onSubmit: (payload: { sku: string; quantity: number; reason: string }) => void;
};

export default function QuarantineModal({ open, sku, onClose, onSubmit }: QuarantineModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setQuantity('1');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>Mise en quarantaine</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="SKU" value={sku ?? ''} disabled fullWidth />
          <TextField
            label="Quantite"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            fullWidth
          />
          <TextField
            label="Motif"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={!sku || !reason.trim()}
          onClick={() => {
            if (!sku) return;
            onSubmit({ sku, quantity: Number(quantity), reason });
            handleClose();
          }}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
