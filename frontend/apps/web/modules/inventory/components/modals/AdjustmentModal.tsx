"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type AdjustmentModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdjustmentModal({ open, onClose }: AdjustmentModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adjustment</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Adjustment placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
