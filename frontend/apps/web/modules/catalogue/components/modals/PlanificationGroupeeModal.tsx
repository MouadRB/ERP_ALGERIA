"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type PlanificationGroupeeModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PlanificationGroupeeModal({
  open,
  onClose
}: PlanificationGroupeeModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Planification</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Planification placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
