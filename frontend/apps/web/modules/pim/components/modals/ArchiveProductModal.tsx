"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ArchiveProductModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ArchiveProductModal({
  open,
  onClose
}: ArchiveProductModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Archive Product</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Archive product placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
