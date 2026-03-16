"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ExportModal({ open, onClose }: ExportModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Export</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Export placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
