"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type NewProductWizardProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewProductWizard({ open, onClose }: NewProductWizardProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Product</DialogTitle>
      <DialogContent>
        <Typography variant="body2">New product wizard placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
