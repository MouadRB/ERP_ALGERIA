"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type QuarantineModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function QuarantineModal({ open, onClose }: QuarantineModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Quarantine</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Quarantine placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
