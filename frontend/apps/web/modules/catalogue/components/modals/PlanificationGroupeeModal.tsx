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
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

type PlanificationGroupeeModalProps = {
  count: number;
  onClose: () => void;
  onConfirm: (scheduledAt: string) => void;
  open: boolean;
};

export default function PlanificationGroupeeModal({
  count,
  onClose,
  onConfirm,
  open,
}: PlanificationGroupeeModalProps) {
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    if (!open) return;
    setScheduledAt('');
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Planification groupee</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Programmer la publication pour {count} produit(s) selectionne(s) avec les mocks du
            catalogue.
          </Typography>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            La date choisie sera appliquee sur toutes les lignes selectionnees et visible
            immediatement dans la liste.
          </Alert>
          <TextField
            fullWidth
            type="datetime-local"
            label="Date de publication"
            InputLabelProps={{ shrink: true }}
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          startIcon={<EventAvailableOutlinedIcon />}
          disabled={!scheduledAt}
          onClick={() => onConfirm(scheduledAt)}
          sx={{ borderRadius: 999 }}
        >
          Planifier
        </Button>
      </DialogActions>
    </Dialog>
  );
}
