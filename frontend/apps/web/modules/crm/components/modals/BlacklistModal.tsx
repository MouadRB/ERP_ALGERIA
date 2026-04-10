'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import type { Customer, BlacklistMotif } from '@ferza/shared';
import { useAddToBlacklist } from '@/modules/crm/hooks/useAddToBlacklist';

const MOTIFS: BlacklistMotif[] = [
  'Refus répété à la livraison',
  'Fraude / tentative d\'arnaque',
  'Adresse fausse répétée',
  'Comportement abusif envers les livreurs',
  'Commandes multiples frauduleuses',
  'Non-paiement répété',
  'Doublon frauduleux',
];

interface Props {
  open:     boolean;
  onClose:  () => void;
  customer: Customer | null;
}

export default function BlacklistModal({ open, onClose, customer }: Props) {
  const [motif,  setMotif]  = useState<BlacklistMotif | ''>('');
  const [reason, setReason] = useState('');
  const [error,  setError]  = useState('');
  const { mutate, isPending } = useAddToBlacklist();

  function handleSubmit() {
    if (!customer) return;
    if (!motif) { setError('Sélectionnez un motif'); return; }
    setError('');
    mutate(
      { id: customer.id, motif, reason: reason.trim() || undefined },
      {
        onSuccess: () => { reset(); onClose(); },
        onError:   (e: unknown) => setError((e as Error).message ?? 'Erreur serveur'),
      },
    );
  }

  function reset() {
    setMotif('');
    setReason('');
    setError('');
  }

  function handleClose() { reset(); onClose(); }

  if (!customer) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <BlockIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Mettre en liste noire
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          <Typography variant="body2" color="text.secondary">
            Client : <strong>{customer.nameFr}</strong> · {customer.phone}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth size="small" error={Boolean(error && !motif)}>
            <InputLabel>Motif *</InputLabel>
            <Select
              value={motif}
              label="Motif *"
              onChange={(e) => setMotif(e.target.value as BlacklistMotif)}
            >
              {MOTIFS.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
            {error && !motif && <FormHelperText>Obligatoire</FormHelperText>}
          </FormControl>
          <TextField
            label="Précisions (facultatif)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="Détails complémentaires…"
            inputProps={{ maxLength: 500 }}
          />
          <Alert severity="warning">
            Cette action bloquera toutes les commandes futures de ce client.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={isPending}
          startIcon={<BlockIcon />}
        >
          {isPending ? 'Mise en liste…' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
