'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardReturnRoundedIcon from '@mui/icons-material/KeyboardReturnRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import type { InventoryItem } from '../../inventory.types';
import type {
  CreateMovementPayload,
  InventoryMovementType,
} from '../../hooks/useCreateMovement';
import { formatDZD } from '../../inventory.ui';

export type InventoryMovementMode = 'receipt' | 'sale' | 'return';

type StockMovementModalProps = {
  open: boolean;
  initialMode?: InventoryMovementMode;
  // Pre-selected items from the page (table row click). When empty, the user
  // picks the product via the autocomplete inside the modal.
  items: InventoryItem[];
  // Source list used to populate the product autocomplete.
  catalog: InventoryItem[];
  onClose: () => void;
  onSubmit: (payload: CreateMovementPayload) => Promise<void>;
};

const MODES: Array<{
  key: InventoryMovementMode;
  label: string;
  description: string;
  icon: typeof AddCircleOutlineRoundedIcon;
  movementType: InventoryMovementType;
}> = [
  {
    key: 'receipt',
    label: 'Entree',
    description: 'Reception fournisseur',
    icon: AddCircleOutlineRoundedIcon,
    movementType: 'receipt',
  },
  {
    key: 'sale',
    label: 'Sortie',
    description: 'Expedition / perte',
    icon: RemoveCircleOutlineRoundedIcon,
    movementType: 'sale',
  },
  {
    key: 'return',
    label: 'Retour Client',
    description: 'Reintegration en stock',
    icon: KeyboardReturnRoundedIcon,
    movementType: 'return',
  },
];

export default function StockMovementModal({
  open,
  initialMode = 'receipt',
  items,
  catalog,
  onClose,
  onSubmit,
}: StockMovementModalProps) {
  const [mode, setMode] = useState<InventoryMovementMode>(initialMode);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [reference, setReference] = useState('');
  const [unitCostHT, setUnitCostHT] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const catalogBySku = useMemo(
    () => new Map(catalog.map((row) => [row.sku, row])),
    [catalog],
  );

  useEffect(() => {
    if (!open) return;
    const first = items[0];
    setMode(initialMode);
    setSelectedSku(first?.sku ?? '');
    setQuantity('1');
    setReference(first?.supplierRef ? `BC-${first.supplierRef}` : '');
    setUnitCostHT(String(first?.costFifo ?? ''));
    setNotes('');
    setError('');
    setSubmitting(false);
  }, [open, items, initialMode]);

  const activeItem = selectedSku ? catalogBySku.get(selectedSku) ?? null : null;
  const quantityNumber = Math.max(Number(quantity) || 0, 0);
  const fifoPreviewValue =
    quantityNumber * (Number(unitCostHT) || activeItem?.costFifo || 0);
  const movementType =
    MODES.find((option) => option.key === mode)?.movementType ?? 'receipt';

  const handleSubmit = async () => {
    if (!activeItem || quantityNumber <= 0) return;
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        sku: activeItem.sku,
        type: movementType,
        quantity: quantityNumber,
        reason: notes || reference || undefined,
        unitCostHT: Number(unitCostHT) || activeItem.costFifo,
        referenceId: reference || undefined,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de l enregistrement.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              bgcolor: 'rgba(88,166,255,0.15)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SyncAltRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Enregistrer un Mouvement de Stock
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.main' }}>
              Tous les mouvements sont enregistres dans le journal immuable
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            {MODES.map((option) => {
              const Icon = option.icon;
              const active = mode === option.key;
              return (
                <Paper
                  key={option.key}
                  variant="outlined"
                  onClick={() => setMode(option.key)}
                  sx={{
                    flex: 1,
                    p: 1.4,
                    borderRadius: 3,
                    cursor: 'pointer',
                    borderColor: active ? '#58a6ff' : '#30363d',
                    bgcolor: active ? 'rgba(88,166,255,0.15)' : '#0d1117',
                  }}
                >
                  <Stack spacing={0.6}>
                    <Icon sx={{ color: active ? '#58a6ff' : '#8b949e' }} />
                    <Typography fontWeight={800}>{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <Autocomplete
            options={catalog}
            value={activeItem}
            onChange={(_, value) => setSelectedSku(value?.sku ?? '')}
            getOptionLabel={(option) => `${option.sku} - ${option.nameFr}`}
            isOptionEqualToValue={(option, value) => option.sku === value.sku}
            disabled={items.length > 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Produit *"
                placeholder="Rechercher par SKU ou nom"
              />
            )}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              label="Quantite *"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              fullWidth
              helperText={
                mode === 'receipt'
                  ? undefined
                  : `${activeItem?.quantityAvailable ?? 0} disponibles`
              }
            />
            <TextField
              label={
                mode === 'receipt'
                  ? 'Bon de Commande lie'
                  : mode === 'return'
                    ? 'Reference commande'
                    : 'Reference'
              }
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              label={mode === 'receipt' ? 'Cout Unitaire HT *' : 'Cout Unitaire'}
              value={unitCostHT}
              onChange={(event) => setUnitCostHT(event.target.value)}
              fullWidth
              helperText={
                mode === 'receipt' ? 'Cree une nouvelle couche FIFO' : undefined
              }
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={1}
            />
          </Stack>

          {mode === 'receipt' && activeItem ? (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 1.5,
                py: 1.35,
                bgcolor: 'rgba(88,166,255,0.15)',
                borderColor: '#58a6ff',
              }}
            >
              <Typography fontWeight={800} sx={{ color: 'primary.main' }}>
                Nouvelle couche FIFO #{(activeItem.fifoLayers?.length ?? 0) + 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quantityNumber} unites x{' '}
                {formatDZD(Number(unitCostHT) || activeItem.costFifo || 0)} ={' '}
                {formatDZD(fifoPreviewValue)}
              </Typography>
            </Paper>
          ) : null}

          {error ? (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 1.5,
                py: 1.2,
                bgcolor: 'rgba(248,81,73,0.15)',
                borderColor: '#f85149',
              }}
            >
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
                {error}
              </Typography>
            </Paper>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
          Ce mouvement sera definitif et tracable dans le journal immuable.
        </Typography>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={!activeItem || quantityNumber <= 0 || submitting}
          onClick={() => void handleSubmit()}
          sx={{ borderRadius: 999 }}
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer Mouvement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
