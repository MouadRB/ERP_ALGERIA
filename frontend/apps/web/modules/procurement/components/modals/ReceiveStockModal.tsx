"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ReceiveStockModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ReceiveStockModal({
  open,
  onClose
}: ReceiveStockModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Receive Stock</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Receive stock placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
