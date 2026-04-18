'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useBulkChangeSupplier } from '@/modules/pim/hooks/useBulkChangeSupplier';

const SUPPLIERS = [
  'Samsung DZ',
  'Nike MENA',
  'Xiaomi DZ',
  'Adidas Maghreb',
  'Apple MENA',
  'Mode & Style SARL',
  'Ferza Studio',
  'Beauty Labs',
  'Orient Maison',
];

interface Props {
  open: boolean;
  onClose: () => void;
  ids: string[];
  onDone?: (message: string) => void;
}

export default function BulkChangeSupplierModal({ open, onClose, ids, onDone }: Props) {
  const mutation = useBulkChangeSupplier();
  const [supplierName, setSupplierName] = useState<string>('');

  useEffect(() => {
    if (open) {
      mutation.reset();
      setSupplierName('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleApply = async () => {
    if (!supplierName) return;
    try {
      await mutation.mutateAsync({ ids, supplierName });
      onDone?.(`Fournisseur mis à jour pour ${ids.length} produit(s).`);
      onClose();
    } catch {
      // error rendered below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Changer le fournisseur</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ce fournisseur sera appliqué à <strong>{ids.length}</strong> produit(s).
          Les bons de commande en cours ne sont pas affectés (géré par Procurement).
        </Typography>
        <Autocomplete
          freeSolo
          options={SUPPLIERS}
          value={supplierName}
          onChange={(_, value) => setSupplierName(value ?? '')}
          onInputChange={(_, value) => setSupplierName(value)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Fournisseur" placeholder="Sélectionner ou saisir…" />
          )}
        />
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(mutation.error as Error)?.message || 'Échec de la mise à jour.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={mutation.isPending || !supplierName || ids.length === 0}
        >
          {mutation.isPending ? 'Mise à jour…' : 'Appliquer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
