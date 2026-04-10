'use client';

import { Box, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface BlacklistFilterState {
  search: string;
  motif:  string;
}

interface Props {
  filters:  BlacklistFilterState;
  onChange: (patch: Partial<BlacklistFilterState>) => void;
}

const MOTIF_OPTIONS = [
  'Tous',
  'Refus répété à la livraison',
  'Fraude / tentative d\'arnaque',
  'Adresse fausse répétée',
  'Comportement abusif envers les livreurs',
  'Commandes multiples frauduleuses',
  'Non-paiement répété',
  'Doublon frauduleux',
];

export default function BlacklistFilters({ filters, onChange }: Props) {
  return (
    <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
      <TextField
        size="small" placeholder="Téléphone, nom..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ minWidth: 220 }}
      />
      <TextField
        select size="small" label="Motif"
        value={filters.motif}
        onChange={(e) => onChange({ motif: e.target.value })}
        sx={{ minWidth: 260 }}
      >
        {MOTIF_OPTIONS.map((m) => (
          <MenuItem key={m} value={m === 'Tous' ? '' : m}>{m}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
