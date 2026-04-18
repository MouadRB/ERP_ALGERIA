'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useBulkChangeTVA } from '@/modules/pim/hooks/useBulkChangeTVA';

const TVA_OPTIONS: Array<{ value: 'standard' | 'reduced' | 'exempt'; label: string }> = [
  { value: 'standard', label: '19% — Standard' },
  { value: 'reduced', label: '9% — Réduit' },
  { value: 'exempt', label: '0% — Exonéré' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  ids: string[];
  onDone?: (message: string) => void;
}

export default function BulkChangeTvaModal({ open, onClose, ids, onDone }: Props) {
  const mutation = useBulkChangeTVA();
  const [tvaRate, setTvaRate] = useState<'standard' | 'reduced' | 'exempt'>('standard');

  useEffect(() => {
    if (open) {
      mutation.reset();
      setTvaRate('standard');
    }
  }, [open, mutation]);

  const handleApply = async () => {
    try {
      await mutation.mutateAsync({ ids, tvaRate });
      const label = TVA_OPTIONS.find((option) => option.value === tvaRate)?.label ?? tvaRate;
      onDone?.(`TVA mise à jour (${label}) pour ${ids.length} produit(s).`);
      onClose();
    } catch {
      // error rendered below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Changer la TVA</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ce taux sera appliqué à <strong>{ids.length}</strong> produit(s). Le prix TTC
          restera inchangé et sera ajusté à la prochaine édition.
        </Typography>
        <RadioGroup
          value={tvaRate}
          onChange={(e) => setTvaRate(e.target.value as 'standard' | 'reduced' | 'exempt')}
        >
          {TVA_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio size="small" />}
              label={option.label}
            />
          ))}
        </RadioGroup>
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
          disabled={mutation.isPending || ids.length === 0}
        >
          {mutation.isPending ? 'Mise à jour…' : 'Appliquer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
