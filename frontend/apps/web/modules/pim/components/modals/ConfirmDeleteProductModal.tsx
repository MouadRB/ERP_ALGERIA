'use client';

import { useEffect } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useDeleteProduct } from '@/modules/pim/hooks/useDeleteProduct';

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  productName?: string;
  onDone?: (message: string) => void;
}

export default function ConfirmDeleteProductModal({
  open,
  onClose,
  productId,
  productName,
  onDone,
}: Props) {
  const mutation = useDeleteProduct();

  useEffect(() => {
    if (open) mutation.reset();
  }, [open, mutation]);

  const handleConfirm = async () => {
    if (!productId) return;
    try {
      await mutation.mutateAsync(productId);
      onDone?.('Produit archivé.');
      onClose();
    } catch {
      // error rendered below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
        Archiver le produit
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          Le produit <strong>{productName || productId}</strong> sera archivé.
          Les commandes en cours ne sont pas affectées (rétention fiscale 10 ans).
        </Typography>
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(mutation.error as Error)?.message || 'Échec de l’archivage.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          disabled={mutation.isPending || !productId}
        >
          {mutation.isPending ? 'Archivage…' : 'Archiver'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
