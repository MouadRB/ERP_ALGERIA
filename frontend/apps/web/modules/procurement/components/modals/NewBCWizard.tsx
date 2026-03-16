"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type NewBCWizardProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewBCWizard({ open, onClose }: NewBCWizardProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New BC</DialogTitle>
      <DialogContent>
        <Typography variant="body2">New BC wizard placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
