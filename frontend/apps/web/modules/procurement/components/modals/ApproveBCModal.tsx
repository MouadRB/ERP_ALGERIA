"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import type { BonCommande } from "@ferza/shared";
import { formatDZD } from "@ferza/shared";

type ApproveBCModalProps = {
  open: boolean;
  bc: BonCommande | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ApproveBCModal({
  open,
  bc,
  submitting = false,
  onClose,
  onConfirm
}: ApproveBCModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Approuver le bon de commande</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            La séparation des tâches reste appliquée. Le créateur ne peut pas approuver son propre BC.
          </Alert>

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" fontWeight={700}>
              {bc?.reference ?? "BC"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fournisseur: {bc?.supplierName ?? "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Articles: {bc?.items.length ?? 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {bc ? formatDZD(bc.totalTTC) : "-"}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Cette action fera passer le BC au statut approuvé et le rendra prêt pour envoi ou réception.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={onConfirm} disabled={!bc || submitting}>
          {submitting ? "Approbation..." : "Confirmer l'approbation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
