"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type QuickLookupModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function QuickLookupModal({
  open,
  onClose
}: QuickLookupModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Quick Lookup</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Quick lookup placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
