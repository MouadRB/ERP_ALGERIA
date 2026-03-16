"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type NewCustomerModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewCustomerModal({
  open,
  onClose
}: NewCustomerModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Customer</DialogTitle>
      <DialogContent>
        <Typography variant="body2">New customer placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
