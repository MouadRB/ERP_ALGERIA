"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type TransferModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function TransferModal({ open, onClose }: TransferModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Transfer</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Transfer placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
