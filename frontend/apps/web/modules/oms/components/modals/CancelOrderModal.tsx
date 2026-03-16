"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type CancelOrderModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CancelOrderModal({ open, onClose }: CancelOrderModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cancel Order</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Cancel order placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
