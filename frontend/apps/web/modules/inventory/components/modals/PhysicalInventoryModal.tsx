'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import type { InventoryItem } from '../../inventory.types';

type PhysicalInventoryModalProps = {
  items: InventoryItem[];
  onApply: (adjustments: Array<{ sku: string; counted: number; diff: number }>) => Promise<void>;
  onClose: () => void;
  open: boolean;
  warehouseLabel: string;
};

export default function PhysicalInventoryModal({
  items,
  onApply,
  onClose,
  open,
  warehouseLabel,
}: PhysicalInventoryModalProps) {
  const [scannerInput, setScannerInput] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    setScannerInput('');
    setCounts(
      Object.fromEntries(
        items.slice(0, Math.min(items.length, 5)).map((item) => [item.sku, item.quantityOnHand]),
      ),
    );
  }, [items, open]);

  const rows = useMemo(
    () =>
      items.map((item) => {
        const counted = counts[item.sku] ?? 0;
        const diff = counted - item.quantityOnHand;
        return {
          counted,
          diff,
          item,
          status: diff === 0 ? 'Conforme' : 'Ecart',
        };
      }),
    [counts, items],
  );

  const countedRows = rows.filter((row) => row.counted > 0).length;
  const progress = items.length > 0 ? Math.round((countedRows / items.length) * 100) : 0;

  const handleScan = () => {
    const query = scannerInput.trim().toLowerCase();
    if (!query) return;

    const item = items.find(
      (row) =>
        row.sku.toLowerCase() === query ||
        row.barcode?.toLowerCase() === query,
    );

    if (item) {
      setCounts((current) => ({
        ...current,
        [item.sku]: (current[item.sku] ?? item.quantityOnHand) + 1,
      }));
    }

    setScannerInput('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 34, height: 34, borderRadius: 2.5, bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChecklistRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Inventaire Physique
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {warehouseLabel} - Demarre: {new Date().toLocaleDateString('fr-DZ')} 10h00
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {countedRows} / {items.length} articles comptes ({progress}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
          />

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="Scanner ou saisir code-barres..."
              value={scannerInput}
              onChange={(event) => setScannerInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleScan();
                }
              }}
            />
            <Button variant="contained" onClick={handleScan} sx={{ borderRadius: 3 }}>
              Valider
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Compatible scanner WMS - Saisie manuelle possible
          </Typography>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Stack direction="row" sx={{ px: 1.5, py: 1.2, bgcolor: 'background.paper', color: 'text.secondary', fontSize: 12, fontWeight: 800 }}>
              <Box sx={{ width: '22%' }}>SKU</Box>
              <Box sx={{ width: '28%' }}>Produit</Box>
              <Box sx={{ width: '14%' }}>Systeme</Box>
              <Box sx={{ width: '14%' }}>Compte</Box>
              <Box sx={{ width: '10%' }}>Ecart</Box>
              <Box sx={{ width: '12%' }}>Statut</Box>
            </Stack>
            {rows.map(({ counted, diff, item, status }) => (
              <Stack key={item.sku} direction="row" alignItems="center" sx={{ px: 1.5, py: 1.15, borderTop: (t) => `1px solid ${t.palette.divider}`, bgcolor: diff !== 0 ? 'rgba(210,153,34,0.12)' : 'transparent' }}>
                <Box sx={{ width: '22%' }}>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {item.sku}
                  </Typography>
                </Box>
                <Box sx={{ width: '28%' }}>
                  <Typography variant="body2" fontWeight={700}>
                    {item.nameFr}
                  </Typography>
                </Box>
                <Box sx={{ width: '14%' }}>
                  <Typography variant="body2">{item.quantityOnHand}</Typography>
                </Box>
                <Box sx={{ width: '14%' }}>
                  <TextField
                    size="small"
                    type="number"
                    value={counted}
                    onChange={(event) =>
                      setCounts((current) => ({
                        ...current,
                        [item.sku]: Number(event.target.value) || 0,
                      }))
                    }
                    sx={{ width: 72 }}
                  />
                </Box>
                <Box sx={{ width: '10%' }}>
                  <Typography variant="body2" sx={{ color: diff === 0 ? '#2ea043' : diff > 0 ? '#58a6ff' : '#f85149', fontWeight: 700 }}>
                    {diff > 0 ? `+${diff}` : diff}
                  </Typography>
                </Box>
                <Box sx={{ width: '12%' }}>
                  <Chip
                    label={status}
                    size="small"
                    sx={{
                      bgcolor: status === 'Conforme' ? 'rgba(46,160,67,0.15)' : 'rgba(210,153,34,0.15)',
                      color: status === 'Conforme' ? '#2ea043' : '#d29922',
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
          {countedRows} / {items.length} articles - {rows.filter((row) => row.diff !== 0).length} ecarts detectes
        </Typography>
        <Button onClick={onClose}>Suspendre</Button>
        <Button
          variant="contained"
          sx={{ borderRadius: 999 }}
          onClick={() =>
            void onApply(
              rows
                .filter((row) => row.diff !== 0)
                .map((row) => ({
                  sku: row.item.sku,
                  counted: row.counted,
                  diff: row.diff,
                })),
            ).then(onClose)
          }
        >
          Continuer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
