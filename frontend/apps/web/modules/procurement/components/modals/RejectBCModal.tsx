"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type RejectBCModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function RejectBCModal({ open, onClose }: RejectBCModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reject BC</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Reject BC placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
