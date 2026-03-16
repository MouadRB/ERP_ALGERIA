"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type LitigeFournisseurModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function LitigeFournisseurModal({
  open,
  onClose
}: LitigeFournisseurModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Litige Fournisseur</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Supplier dispute placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
