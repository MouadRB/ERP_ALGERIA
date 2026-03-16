"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type AssignCarrierModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AssignCarrierModal({
  open,
  onClose
}: AssignCarrierModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Assign Carrier</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Assign carrier placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
