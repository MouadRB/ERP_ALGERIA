"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ConfirmOrderModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ConfirmOrderModal({
  open,
  onClose
}: ConfirmOrderModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Order</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Confirm order placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
