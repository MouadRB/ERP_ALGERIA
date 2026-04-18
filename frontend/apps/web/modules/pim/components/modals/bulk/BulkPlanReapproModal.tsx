'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { usePlanReappro } from '@/modules/pim/hooks/usePlanReappro';

interface Props {
  open: boolean;
  onClose: () => void;
  ids: string[];
  onDone?: (message: string) => void;
}

export default function BulkPlanReapproModal({ open, onClose, ids, onDone }: Props) {
  const mutation = usePlanReappro();
  const [date, setDate] = useState('');
  const [qty, setQty] = useState<number>(0);

  useEffect(() => {
    if (open) {
      mutation.reset();
      setDate('');
      setQty(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleApply = async () => {
    try {
      await mutation.mutateAsync({ ids, date, qty });
      onDone?.(`Réappro. planifiée pour ${ids.length} produit(s).`);
      onClose();
    } catch {
      // error rendered below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Planifier un réapprovisionnement</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Planification pour <strong>{ids.length}</strong> produit(s). L’intégration complète
          avec le module Procurement sera finalisée ultérieurement.
        </Typography>
        <Stack spacing={2}>
          <TextField
            type="date"
            label="Date prévue"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            type="number"
            label="Quantité par produit"
            size="small"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Stack>
        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(mutation.error as Error)?.message || 'Échec de la planification.'}
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
          disabled={mutation.isPending || ids.length === 0 || !date}
        >
          {mutation.isPending ? 'Planification…' : 'Planifier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
