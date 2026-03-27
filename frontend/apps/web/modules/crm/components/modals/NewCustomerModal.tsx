'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { WILAYAS } from '@ferza/shared';
import { useCreateCustomer } from '@/modules/crm/hooks/useCreateCustomer';

interface Props {
  open:       boolean;
  onClose:    () => void;
  onCreated?: (id: string) => void;
}

const EMPTY = { phone: '', phoneSec: '', nameFr: '', nameAr: '', wilayaCode: '', commune: '', address: '' };

export default function NewCustomerModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const { mutate, isPending } = useCreateCustomer();

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value as string }));
  }

  function validate(): string {
    if (!form.phone.trim())  return 'Le téléphone est obligatoire';
    if (!/^(0[5-7]\d{8})$/.test(form.phone.replace(/\s/g,'')))
      return 'Format téléphone invalide (ex: 0551234567)';
    if (!form.nameFr.trim()) return 'Le nom (FR) est obligatoire';
    return '';
  }

  function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    mutate(
      {
        phone:       form.phone.trim(),
        phoneSec:    form.phoneSec.trim() || undefined,
        nameFr:      form.nameFr.trim(),
        nameAr:      form.nameAr.trim() || undefined,
        wilayaCode:  form.wilayaCode || undefined,
        commune:     form.commune.trim() || undefined,
        address:     form.address.trim() || undefined,
      } as Parameters<typeof mutate>[0],
      {
        onSuccess: (res) => { setForm(EMPTY); onClose(); onCreated?.(res.data.id); },
        onError:   (e: unknown) => setError((e as Error).message ?? 'Erreur serveur'),
      },
    );
  }

  function handleClose() {
    setForm(EMPTY);
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouveau client</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Téléphone principal *"
              value={form.phone}
              onChange={set('phone')}
              fullWidth
              size="small"
              placeholder="0551234567"
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              label="Téléphone secondaire"
              value={form.phoneSec}
              onChange={set('phoneSec')}
              fullWidth
              size="small"
              placeholder="0661234567"
              inputProps={{ maxLength: 10 }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Nom (FR) *"
              value={form.nameFr}
              onChange={set('nameFr')}
              fullWidth
              size="small"
              placeholder="Prénom NOM"
            />
            <TextField
              label="Nom (AR)"
              value={form.nameAr}
              onChange={set('nameAr')}
              fullWidth
              size="small"
              placeholder="الاسم بالعربية"
              inputProps={{ dir: 'rtl' }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Wilaya</InputLabel>
              <Select
                value={form.wilayaCode}
                label="Wilaya"
                onChange={(e) => setForm((p) => ({ ...p, wilayaCode: e.target.value }))}
              >
                <MenuItem value="">—</MenuItem>
                {WILAYAS.map((w) => (
                  <MenuItem key={w.code} value={w.code}>
                    {w.code} · {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Commune"
              value={form.commune}
              onChange={set('commune')}
              fullWidth
              size="small"
            />
          </Stack>
          <TextField
            label="Adresse"
            value={form.address}
            onChange={set('address')}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending}>
          {isPending ? 'Création…' : 'Créer le client'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
