'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useOCRImport } from '../hooks/useOCRImport';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FIELDS = [
  { label: 'Nom FR', confidence: 92 },
  { label: 'Prix', confidence: 78 },
  { label: 'Cout', confidence: 82 },
  { label: 'Categorie', confidence: 71 },
];

export default function OcrImportModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useOCRImport();
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [progress, setProgress] = useState(0);

  const subtitle = useMemo(() => {
    if (step === 'upload') return 'Importer une facture fournisseur et creer des brouillons PIM.';
    if (step === 'review') return 'Validation mock OCR avant creation des produits.';
    return 'Import termine avec succes.';
  }, [step]);

  const reset = () => {
    setFileName('');
    setStep('upload');
    setProgress(0);
    mutation.reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setProgress(20);
    setStep('review');
  };

  const handleImport = async () => {
    setProgress(35);
    await mutation.mutateAsync({ imageUrl: fileName || 'ocr-import.pdf' });
    setProgress(100);
    setStep('done');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'rgba(88,166,255,0.15)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SyncAltIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Importer via OCR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          hidden
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {step === 'upload' && (
          <Box
            onClick={() => inputRef.current?.click()}
            sx={{
              border: '2px dashed #58a6ff',
              borderRadius: 3,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'rgba(88,166,255,0.15)',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 42, color: 'primary.main', mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Glisser un PDF fournisseur ou cliquer pour choisir
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Les produits extraits seront crees en statut OCR Import.
            </Typography>
          </Box>
        )}

        {step === 'review' && (
          <Stack spacing={2}>
            <Alert severity="info">
              Fichier charge: <strong>{fileName}</strong>. La simulation OCR a prepare 3 brouillons.
            </Alert>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Champs detectes
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {FIELDS.map((field) => (
                  <Chip
                    key={field.label}
                    label={`${field.label} ${field.confidence}%`}
                    color={field.confidence >= 85 ? 'success' : 'warning'}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
            <Button variant="contained" onClick={handleImport} disabled={mutation.isPending}>
              {mutation.isPending ? 'Import en cours...' : 'Creer les brouillons OCR'}
            </Button>
          </Stack>
        )}

        {step === 'done' && (
          <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 46, color: 'success.main' }} />
            <Typography variant="h6" fontWeight={700}>
              Import OCR termine
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {mutation.data?.meta?.total ?? mutation.data?.data?.length ?? 0} produits ont ete ajoutes au
              PIM avec le statut <strong>OCR Import</strong>.
            </Typography>
            <Button variant="contained" onClick={handleClose}>
              Fermer
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
