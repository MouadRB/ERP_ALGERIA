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
  Typography,
} from '@mui/material';
import type { Customer, TicketCategory, TicketPriority } from '@ferza/shared';
import { useCreateTicket } from '@/modules/crm/hooks/useCreateTicket';

const CATEGORIES: TicketCategory[] = [
  'Retard de livraison',
  'Colis endommagé',
  'Produit non conforme',
  'Annulation demandée',
  'Remboursement',
  'Problème de paiement',
  'Autre',
];

const PRIORITIES: TicketPriority[] = ['Faible', 'Normale', 'Haute', 'Critique'];

interface Props {
  open:     boolean;
  onClose:  () => void;
  customer: Customer | null;
}

const EMPTY = {
  category:    '' as TicketCategory | '',
  priority:    'Normale' as TicketPriority,
  orderId:     '',
  subject:     '',
  description: '',
};

export default function NewTicketModal({ open, onClose, customer }: Props) {
  const [form,  setForm]  = useState(EMPTY);
  const [error, setError] = useState('');
  const { mutate, isPending } = useCreateTicket();

  function set<K extends keyof typeof EMPTY>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value as typeof EMPTY[K] }));
  }

  function handleSubmit() {
    if (!customer) return;
    if (!form.category) { setError('Sélectionnez une catégorie'); return; }
    if (!form.subject.trim()) { setError('Le sujet est obligatoire'); return; }
    setError('');
    mutate(
      {
        customerId:         customer.id,
        customerPhone:      customer.phone,
        customerNameFr:     customer.nameFr,
        customerWilayaCode: customer.wilayaCode,
        orderId:            form.orderId.trim() || null,
        category:           form.category,
        priority:           form.priority,
        subject:            form.subject.trim(),
        description:        form.description.trim() || undefined,
      },
      {
        onSuccess: () => { setForm(EMPTY); onClose(); },
        onError:   (e: unknown) => setError((e as Error).message ?? 'Erreur serveur'),
      },
    );
  }

  function handleClose() { setForm(EMPTY); setError(''); onClose(); }

  if (!customer) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ouvrir un ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          <Typography variant="body2" color="text.secondary">
            Client : <strong>{customer.nameFr}</strong> · {customer.phone}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Catégorie *</InputLabel>
              <Select
                value={form.category}
                label="Catégorie *"
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TicketCategory }))}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Priorité</InputLabel>
              <Select
                value={form.priority}
                label="Priorité"
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TicketPriority }))}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Commande liée (optionnel)"
            value={form.orderId}
            onChange={set('orderId')}
            fullWidth
            size="small"
            placeholder="ORD-XXXXXXXX"
          />
          <TextField
            label="Sujet *"
            value={form.subject}
            onChange={set('subject')}
            fullWidth
            size="small"
            placeholder="Résumé en une ligne du problème"
            inputProps={{ maxLength: 120 }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={set('description')}
            fullWidth
            size="small"
            multiline
            rows={4}
            placeholder="Détails du problème, actions déjà tentées…"
            inputProps={{ maxLength: 1000 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending}>
          {isPending ? 'Création…' : 'Ouvrir le ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
