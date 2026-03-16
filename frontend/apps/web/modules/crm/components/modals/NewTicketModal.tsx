"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type NewTicketModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewTicketModal({ open, onClose }: NewTicketModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Ticket</DialogTitle>
      <DialogContent>
        <Typography variant="body2">New ticket placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
