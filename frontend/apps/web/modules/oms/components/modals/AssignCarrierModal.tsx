'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon         from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckIcon         from '@mui/icons-material/Check';
import { useEffect, useState } from 'react';
import { useAssignCarrier } from '@/modules/oms/hooks/useAssignCarrier';

// ─── Carrier config ───────────────────────────────────────────────────────────

type CarrierKey = 'Yalidine' | 'Maystro' | 'Ecotrack' | 'Procolis';

const CARRIERS: {
  key:     CarrierKey;
  color:   string;
  bgLight: string;
  desc:    string;
}[] = [
  {
    key:     'Yalidine',
    color: 'primary.main',
    bgLight: 'rgba(88,166,255,0.15)',
    desc:    'Livraison J+1 · 48 wilayas',
  },
  {
    key:     'Maystro',
    color: 'warning.main',
    bgLight: 'rgba(210,153,34,0.15)',
    desc:    'Livraison J+2 · 48 wilayas',
  },
  {
    key:     'Ecotrack',
    color: 'success.main',
    bgLight: 'rgba(46,160,67,0.15)',
    desc:    'Suivi en temps réel · 48 wilayas',
  },
  {
    key:     'Procolis',
    color:   '#bc8cff',
    bgLight: 'rgba(188,140,255,0.15)',
    desc:    'COD difficile · Zones rurales',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:    boolean;
  orderId: string;
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignCarrierModal({ open, orderId, onClose }: Props) {
  const assignCarrier             = useAssignCarrier();
  const [selected, setSelected]   = useState<CarrierKey | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(null);
      assignCarrier.reset();
    }
  }, [open]);

  const handleAssign = () => {
    if (!selected) return;
    assignCarrier.mutate(
      { id: orderId, carrier: selected },
      { onSuccess: () => setTimeout(onClose, 700) },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      {/* ── Title ─────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          pb:             1.5,
          pt:             2.5,
          px:             3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <LocalShippingIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography fontWeight={700} fontSize={16}>
            Affecter un transporteur
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* ── Content ───────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 12, display: 'block', mb: 2 }}
        >
          Sélectionnez le transporteur pour cette commande. La commande passera
          en état <strong>En attente d'enlèvement</strong>.
        </Typography>

        {/* Carrier radio cards */}
        <Box display="flex" flexDirection="column" gap={1.25}>
          {CARRIERS.map((c) => {
            const isSelected = selected === c.key;
            return (
              <Box
                key={c.key}
                onClick={() => setSelected(c.key)}
                sx={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             1.5,
                  p:               1.5,
                  border:          '2px solid',
                  borderColor:     isSelected ? c.color : 'divider',
                  borderRadius:    2,
                  backgroundColor: isSelected ? c.bgLight : 'background.paper',
                  cursor:          'pointer',
                  transition:      'all 0.15s',
                  '&:hover': {
                    borderColor:     c.color,
                    backgroundColor: c.bgLight,
                  },
                }}
              >
                {/* Carrier icon circle */}
                <Box
                  sx={{
                    width:           40,
                    height:          40,
                    borderRadius:    '50%',
                    backgroundColor: isSelected ? c.color : `${c.color}18`,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    transition:      'all 0.15s',
                  }}
                >
                  <LocalShippingIcon
                    sx={{
                      fontSize: 20,
                      color:    isSelected ? '#fff' : c.color,
                    }}
                  />
                </Box>

                {/* Carrier info */}
                <Box flex={1}>
                  <Typography
                    fontWeight={700}
                    fontSize={14}
                    sx={{ color: isSelected ? c.color : 'text.primary' }}
                  >
                    {c.key}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11 }}
                  >
                    {c.desc}
                  </Typography>
                </Box>

                {/* Check indicator */}
                <Box
                  sx={{
                    width:           22,
                    height:          22,
                    borderRadius:    '50%',
                    border:          '2px solid',
                    borderColor:     isSelected ? c.color : 'divider',
                    backgroundColor: isSelected ? c.color : 'transparent',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    transition:      'all 0.15s',
                  }}
                >
                  {isSelected && (
                    <CheckIcon sx={{ fontSize: 13, color: '#fff' }} />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Success */}
        {assignCarrier.isSuccess && (
          <Alert severity="success" sx={{ mt: 2, fontSize: 12 }}>
            Transporteur affecté avec succès.
          </Alert>
        )}

        {/* Error */}
        {assignCarrier.isError && (
          <Alert severity="error" sx={{ mt: 2, fontSize: 12 }}>
            Une erreur est survenue. Veuillez réessayer.
          </Alert>
        )}
      </DialogContent>

      <Divider />

      {/* ── Actions ───────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          disabled={assignCarrier.isPending}
          sx={{
            textTransform: 'none',
            fontWeight:    500,
            borderRadius:  1.5,
            fontSize:      13,
          }}
        >
          Annuler
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleAssign}
          disabled={
            !selected              ||
            assignCarrier.isPending ||
            assignCarrier.isSuccess
          }
          startIcon={
            assignCarrier.isPending
              ? <CircularProgress size={14} color="inherit" />
              : <LocalShippingIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            textTransform: 'none',
            fontWeight:    700,
            borderRadius:  1.5,
            fontSize:      13,
            boxShadow:     'none',
            '&:hover':     { boxShadow: 'none' },
          }}
        >
          {assignCarrier.isPending
            ? 'Affectation...'
            : assignCarrier.isSuccess
            ? 'Affecté ✓'
            : 'Affecter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
