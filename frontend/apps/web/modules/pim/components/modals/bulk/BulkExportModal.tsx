'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useExportProducts } from '@/modules/pim/hooks/useExportProducts';

const COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'sku', label: 'SKU' },
  { key: 'nameFr', label: 'Nom FR' },
  { key: 'nameAr', label: 'Nom AR' },
  { key: 'categoryId', label: 'Catégorie' },
  { key: 'supplierName', label: 'Fournisseur' },
  { key: 'priceHT', label: 'Prix HT' },
  { key: 'priceTTC', label: 'Prix TTC' },
  { key: 'tvaRate', label: 'TVA' },
  { key: 'status', label: 'Statut' },
  { key: 'totalStock', label: 'Stock total' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onDone?: (message: string) => void;
}

export default function BulkExportModal({ open, onClose, selectedIds, onDone }: Props) {
  const mutation = useExportProducts();
  const [scope, setScope] = useState<'selected' | 'all'>(
    selectedIds.length > 0 ? 'selected' : 'all',
  );
  const [columns, setColumns] = useState<string[]>(COLUMNS.map((column) => column.key));

  useEffect(() => {
    if (open) {
      mutation.reset();
      setScope(selectedIds.length > 0 ? 'selected' : 'all');
      setColumns(COLUMNS.map((column) => column.key));
    }
  }, [open, selectedIds.length, mutation]);

  const toggleColumn = (key: string) => {
    setColumns((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const handleExport = async () => {
    try {
      const response = await mutation.mutateAsync({
        ids: scope === 'selected' ? selectedIds : [],
        columns,
      });
      onDone?.(`${response.data?.count ?? 0} produit(s) exporté(s) en CSV.`);
      onClose();
    } catch {
      // surface via mutation.error below
    }
  };

  const disabled = mutation.isPending || columns.length === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Exporter les produits</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choisissez la portée et les colonnes à inclure dans le fichier CSV.
        </Typography>

        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Portée
        </Typography>
        <RadioGroup value={scope} onChange={(e) => setScope(e.target.value as 'selected' | 'all')}>
          <FormControlLabel
            value="selected"
            control={<Radio size="small" />}
            label={`Sélection actuelle (${selectedIds.length} produit${selectedIds.length > 1 ? 's' : ''})`}
            disabled={selectedIds.length === 0}
          />
          <FormControlLabel
            value="all"
            control={<Radio size="small" />}
            label="Tous les produits"
          />
        </RadioGroup>

        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mt: 2 }}>
          Colonnes
        </Typography>
        <Stack>
          {COLUMNS.map((column) => (
            <FormControlLabel
              key={column.key}
              control={
                <Checkbox
                  size="small"
                  checked={columns.includes(column.key)}
                  onChange={() => toggleColumn(column.key)}
                />
              }
              label={column.label}
            />
          ))}
        </Stack>

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(mutation.error as Error)?.message || 'Échec de l’export.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleExport} disabled={disabled}>
          {mutation.isPending ? 'Export en cours…' : 'Exporter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
