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

type LitigeFournisseurModalProps = {
  open: boolean;
  bc: BonCommande | null;
  onClose: () => void;
  onSubmit: (summary: string) => void;
};

export default function LitigeFournisseurModal({
  open,
  bc,
  onClose,
  onSubmit
}: LitigeFournisseurModalProps) {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (open) {
      setSubject("");
      setDetails("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Litige Fournisseur</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Ouvrir un litige pour {bc?.supplierName ?? "ce fournisseur"} lié au BC {bc?.reference ?? "-"}.
          </Typography>
          <TextField
            label="Objet"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Retard, qualité, quantité, prix..."
          />
          <TextField
            label="Détails"
            multiline
            minRows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Décrivez précisément le litige fournisseur..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={subject.trim().length < 3 || details.trim().length < 10}
          onClick={() => onSubmit(`${subject.trim()} — ${details.trim()}`)}
        >
          Ouvrir le litige
        </Button>
      </DialogActions>
    </Dialog>
  );
}
