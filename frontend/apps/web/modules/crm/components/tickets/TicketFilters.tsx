'use client';

import { Box, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface TicketFilterState {
  search:   string;
  status:   string;
  category: string;
  priority: string;
}

interface Props {
  filters:  TicketFilterState;
  onChange: (patch: Partial<TicketFilterState>) => void;
}

const STATUS_OPTIONS   = ['Tous', 'Ouvert', 'En cours', 'En attente client', 'Escaladé', 'Résolu', 'Fermé'];
const CATEGORY_OPTIONS = ['Tous', 'Retard de livraison', 'Colis endommagé', 'Produit non conforme', 'Annulation demandée', 'Remboursement', 'Problème de paiement', 'Autre'];
const PRIORITY_OPTIONS = ['Tous', 'Faible', 'Normale', 'Haute', 'Critique'];

export default function TicketFilters({ filters, onChange }: Props) {
  return (
    <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
      <TextField
        size="small" placeholder="#ticket, téléphone, nom..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ minWidth: 220 }}
      />
      <TextField select size="small" label="Catégorie" value={filters.category} onChange={(e) => onChange({ category: e.target.value })} sx={{ minWidth: 200 }}>
        {CATEGORY_OPTIONS.map((o) => <MenuItem key={o} value={o === 'Tous' ? '' : o}>{o}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Statut" value={filters.status} onChange={(e) => onChange({ status: e.target.value })} sx={{ minWidth: 160 }}>
        {STATUS_OPTIONS.map((o) => <MenuItem key={o} value={o === 'Tous' ? '' : o}>{o}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Priorité" value={filters.priority} onChange={(e) => onChange({ priority: e.target.value })} sx={{ minWidth: 130 }}>
        {PRIORITY_OPTIONS.map((o) => <MenuItem key={o} value={o === 'Tous' ? '' : o}>{o}</MenuItem>)}
      </TextField>
    </Box>
  );
}
