'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useManageRestrictions } from '@/modules/pim/hooks/useManageRestrictions';

const ALL_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M’Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El Meghaier', 'El Meniaa',
];

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  initialRestricted: string[];
  onDone?: (restricted: string[]) => void;
}

export default function ManageRestrictionsModal({
  open,
  onClose,
  productId,
  initialRestricted,
  onDone,
}: Props) {
  const mutation = useManageRestrictions();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      mutation.reset();
      setSelected(initialRestricted || []);
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialRestricted]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_WILAYAS;
    return ALL_WILAYAS.filter((w) => w.toLowerCase().includes(q));
  }, [search]);

  const toggle = (wilaya: string) => {
    setSelected((current) =>
      current.includes(wilaya)
        ? current.filter((w) => w !== wilaya)
        : [...current, wilaya],
    );
  };

  const selectAll = () => setSelected([...ALL_WILAYAS]);
  const clearAll = () => setSelected([]);

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({ productId, wilayasRestreintes: selected });
      onDone?.(selected);
      onClose();
    } catch {
      // error displayed below
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Gérer les restrictions par wilaya
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher une wilaya…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button size="small" onClick={selectAll}>
            Tout restreindre
          </Button>
          <Button size="small" onClick={clearAll}>
            Tout autoriser
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {selected.length} / {ALL_WILAYAS.length} wilayas restreintes
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 0.5,
            maxHeight: 360,
            overflowY: 'auto',
            border: '1px solid', borderColor: 'divider',
            borderRadius: 1.5,
            p: 1,
          }}
        >
          {filtered.map((wilaya) => (
            <FormControlLabel
              key={wilaya}
              control={
                <Checkbox
                  size="small"
                  checked={selected.includes(wilaya)}
                  onChange={() => toggle(wilaya)}
                />
              }
              label={<Typography variant="body2">{wilaya}</Typography>}
            />
          ))}
        </Box>

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {(mutation.error as Error)?.message || 'Échec de la mise à jour des restrictions.'}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={mutation.isPending || !productId}
        >
          {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
