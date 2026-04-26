"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { BonCommande } from "@ferza/shared";

type RejectBCModalProps = {
  open: boolean;
  bc: BonCommande | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function RejectBCModal({
  open,
  bc,
  submitting = false,
  onClose,
  onConfirm
}: RejectBCModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason(bc?.rejectionReason ?? "");
    }
  }, [bc, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rejeter le bon de commande</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {bc?.reference ?? "Ce BC"} sera marqué comme refusé. La raison sera visible dans l'audit.
          </Typography>
          <TextField
            label="Raison du rejet"
            multiline
            minRows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Expliquez le rejet budgétaire, fournisseur, conformité, quantités..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          color="error"
          disabled={!bc || reason.trim().length < 10 || submitting}
          onClick={() => onConfirm(reason.trim())}
        >
          {submitting ? "Rejet..." : "Confirmer le rejet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
