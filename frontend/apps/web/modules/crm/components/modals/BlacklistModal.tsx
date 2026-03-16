"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type BlacklistModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BlacklistModal({ open, onClose }: BlacklistModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Blacklist</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Blacklist placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
