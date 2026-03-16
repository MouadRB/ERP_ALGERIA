"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ApproveBCModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ApproveBCModal({ open, onClose }: ApproveBCModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Approve BC</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Approve BC placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
