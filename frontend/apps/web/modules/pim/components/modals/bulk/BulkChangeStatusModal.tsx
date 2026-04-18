'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useBulkChangeStatus } from '@/modules/pim/hooks/useBulkChangeStatus';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'archived', label: 'Archivé' },
  { value: 'discontinued', label: 'Discontinué' },
  { value: 'signaled', label: 'Signalé' },
  { value: 'ocr_import', label: 'Import OCR' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  ids: string[];
  onDone?: (message: string) => void;
}

export default function BulkChangeStatusModal({ open, onClose, ids, onDone }: Props) {
  const mutation = useBulkChangeStatus();
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (open) {
      mutation.reset();
      setStatus('active');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleApply = async () => {
    try {
      await mutation.mutateAsync({ ids, status });
      const label = STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
      onDone?.(`${ids.length} produit(s) passés à « ${label} ».`);
      onClose();
    } catch {
      // error rendered below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Changer le statut</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ce statut sera appliqué à <strong>{ids.length}</strong> produit(s).
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Nouveau statut</InputLabel>
          <Select
            label="Nouveau statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
