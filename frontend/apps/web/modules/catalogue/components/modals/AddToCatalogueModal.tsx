"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type AddToCatalogueModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddToCatalogueModal({
  open,
  onClose
}: AddToCatalogueModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add To Catalogue</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Add to catalogue placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
