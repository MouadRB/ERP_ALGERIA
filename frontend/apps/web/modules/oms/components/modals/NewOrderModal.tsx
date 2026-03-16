"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type NewOrderModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewOrderModal({ open, onClose }: NewOrderModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Order</DialogTitle>
      <DialogContent>
        <Typography variant="body2">New order form placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
