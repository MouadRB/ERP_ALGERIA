"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";

type OCRImportModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function OCRImportModal({ open, onClose }: OCRImportModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>OCR Import</DialogTitle>
      <DialogContent>
        <Typography variant="body2">OCR import placeholder.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
