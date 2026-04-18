'use client';

import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { Category } from '../../hooks/useCategoryMutations';

type CategoryModalProps = {
  categories: Category[];
  initialData?: Category | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (data: { nameFr: string; nameAr: string; parentId: string | null; slug: string }) => void;
  open: boolean;
};

export default function CategoryModal({
  categories,
  initialData,
  isPending,
  onClose,
  onSubmit,
  open,
}: CategoryModalProps) {
  const isEdit = Boolean(initialData);
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (open) {
      setNameFr(initialData?.nameFr ?? '');
      setNameAr(initialData?.nameAr ?? '');
      setParentId(initialData?.parentId ?? null);
      setSlug(initialData?.slug ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!isEdit && nameFr) {
      const parent = categories.find((cat) => cat.id === parentId);
      const prefix = parent
        ? `/categories/${parent.nameFr.toLowerCase().replace(/\s+/g, '-')}`
        : '/categories';
      setSlug(`${prefix}/${nameFr.toLowerCase().replace(/\s+/g, '-')}`);
    }
  }, [nameFr, parentId, isEdit, categories]);

  const rootCategories = categories.filter((cat) => !cat.parentId);
  const selectedParent = categories.find((cat) => cat.id === parentId) ?? null;

  const handleSubmit = () => {
    if (!nameFr.trim()) return;
    onSubmit({ nameFr: nameFr.trim(), nameAr: nameAr.trim(), parentId, slug });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Modifier la categorie' : 'Ajouter une categorie'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Nom FR"
            size="small"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Nom AR"
            size="small"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            dir="rtl"
          />
          <Autocomplete
            options={rootCategories}
            getOptionLabel={(opt) => opt.nameFr}
            value={selectedParent}
            onChange={(_, value) => setParentId(value?.id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Categorie parente" size="small" />
            )}
          />
          <TextField
            fullWidth
            label="Slug SEO"
            size="small"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="Genere automatiquement. Modifier avec precaution."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!nameFr.trim() || isPending}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}
        >
          {isPending ? 'En cours...' : isEdit ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
