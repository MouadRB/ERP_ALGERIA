'use client';

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { useCreateProduct } from '../../hooks/useCreateProduct';

type NewProductWizardProps = {
  open: boolean;
  onClose: () => void;
};

const INITIAL_FORM = {
  nameFr: '',
  nameAr: '',
  imageUrl: '',
  categoryId: 'Electronique',
  supplierName: '',
  supplierRef: '',
  priceTTC: '0',
  costFifo: '0',
  initialStock: '0',
};
const MAX_IMAGE_DATA_URL_LENGTH = 600_000;

const fileToDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Format image invalide.'));
    };
    reader.onerror = () => reject(new Error('Impossible de lire l image.'));
    reader.readAsDataURL(file);
  });

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Impossible de charger cette image.'));
    };
    image.src = objectUrl;
  });

const compressImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier selectionne n est pas une image.');
  }

  const image = await loadImage(file);
  const maxSide = 960;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas indisponible pour compresser l image.');
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const primaryMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const primaryQuality = primaryMime === 'image/jpeg' ? 0.78 : undefined;
  let dataUrl = canvas.toDataURL(primaryMime, primaryQuality);

  if (dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) return dataUrl;

  dataUrl = canvas.toDataURL('image/jpeg', 0.68);
  return dataUrl;
};

export default function NewProductWizard({ open, onClose }: NewProductWizardProps) {
  const createProduct = useCreateProduct();
  const [form, setForm] = useState(INITIAL_FORM);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitError, setSubmitError] = useState('');

  const profit = useMemo(() => {
    const sale = Number(form.priceTTC || 0);
    const cost = Number(form.costFifo || 0);
    return sale - cost;
  }, [form.costFifo, form.priceTTC]);

  const updateField = (field: keyof typeof INITIAL_FORM, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleClose = () => {
    if (createProduct.isPending) return;
    setForm(INITIAL_FORM);
    setSubmitError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSubmitError('');
      let value = await compressImage(file);

      // Final guard: keep payload safe for mock BFF (express body limit 1mb).
      if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
        value = await fileToDataUrl(file);
      }
      if (value.length > MAX_IMAGE_DATA_URL_LENGTH) {
        throw new Error('Image trop lourde. Utilisez une image plus legere ou un lien URL.');
      }

      updateField('imageUrl', value);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Image invalide.');
      updateField('imageUrl', '');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError('');
      const imageUrl = form.imageUrl.trim();
      if (imageUrl.startsWith('data:') && imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
        setSubmitError('Image trop lourde. Utilisez une image plus legere ou un lien URL.');
        return;
      }

      await createProduct.mutateAsync({
        ...form,
        priceTTC: Number(form.priceTTC),
        costFifo: Number(form.costFifo),
        initialStock: Number(form.initialStock),
        priceHT: Math.round(Number(form.priceTTC || 0) / 1.19),
        status: 'draft',
        mediaUrls: imageUrl ? [imageUrl] : [],
      });
      handleClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Creation du produit impossible.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AddBoxOutlinedIcon sx={{ color: 'primary.main' }} />
          <BoxText
            title="Nouveau Produit"
            subtitle="Creation rapide d une fiche PIM en brouillon avec stock initial mock."
          />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom produit FR"
              value={form.nameFr}
              onChange={(event) => updateField('nameFr', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom produit AR"
              value={form.nameAr}
              onChange={(event) => updateField('nameAr', event.target.value)}
              inputProps={{ dir: 'rtl' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
              <Avatar
                variant="rounded"
                src={form.imageUrl.trim() || undefined}
                sx={{
                  width: 62,
                  height: 62,
                  bgcolor: 'background.paper',
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <BrokenImageOutlinedIcon sx={{ color: 'text.secondary' }} />
              </Avatar>
              <TextField
                fullWidth
                label="Image (URL ou fichier)"
                placeholder="https://.../image.jpg"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                helperText="Collez un lien image ou choisissez un fichier image leger."
              />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handlePickImage} sx={{ whiteSpace: 'nowrap' }}>
                  Choisir image
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => updateField('imageUrl', '')}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Effacer
                </Button>
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageFileChange}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Categorie"
              value={form.categoryId}
              onChange={(event) => updateField('categoryId', event.target.value)}
            >
              {['Electronique', 'Mode', 'Sport', 'Maison', 'Beaute'].map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fournisseur"
              value={form.supplierName}
              onChange={(event) => updateField('supplierName', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Reference fournisseur"
              value={form.supplierRef}
              onChange={(event) => updateField('supplierRef', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Prix TTC"
              type="number"
              value={form.priceTTC}
              onChange={(event) => updateField('priceTTC', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cout FIFO"
              type="number"
              value={form.costFifo}
              onChange={(event) => updateField('costFifo', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Stock initial"
              type="number"
              value={form.initialStock}
              onChange={(event) => updateField('initialStock', event.target.value)}
            />
          </Grid>
        </Grid>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            mt: 3,
            border: '1px solid rgba(88,166,255,0.15)',
            bgcolor: 'rgba(88,166,255,0.15)',
            borderRadius: 2,
            p: 2,
          }}
        >
          <BoxText
            title={`${Number(form.priceTTC || 0).toLocaleString('fr-DZ')} DZD`}
            subtitle="Prix TTC"
          />
          <BoxText
            title={`${Number(form.costFifo || 0).toLocaleString('fr-DZ')} DZD`}
            subtitle="Cout FIFO"
          />
          <BoxText
            title={`${profit.toLocaleString('fr-DZ')} DZD`}
            subtitle="Marge brute theorique"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={createProduct.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.nameFr.trim() || !form.supplierName.trim() || createProduct.isPending}
        >
          {createProduct.isPending ? 'Creation...' : 'Creer le produit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BoxText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
}
