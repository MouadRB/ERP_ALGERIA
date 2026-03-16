"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type ApercuClientModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ApercuClientModal({
  open,
  onClose
}: ApercuClientModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Apercu Client</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Client preview placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
