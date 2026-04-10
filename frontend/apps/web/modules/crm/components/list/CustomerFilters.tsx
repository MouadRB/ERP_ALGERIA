'use client';

import { Box, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { WILAYAS } from '@ferza/shared';

export interface CustomerFilterState {
  search:     string;
  segment:    string;
  wilayaCode: string;
  sort:       string;
  riskLevel:  string;
}

interface Props {
  filters:   CustomerFilterState;
  onChange:  (patch: Partial<CustomerFilterState>) => void;
}

const SEGMENT_OPTIONS = ['Tous', 'VIP', 'Fidèle', 'Nouveau', 'Inactif', 'A risque', 'Liste noire'];
const SORT_OPTIONS = [
  { value: 'last_order',    label: 'Dernière commande' },
  { value: 'ca_desc',       label: 'CA total (desc)' },
  { value: 'commandes_desc',label: 'Nb commandes (desc)' },
  { value: 'retour_desc',   label: 'Taux retour (desc)' },
  { value: 'risque_desc',   label: 'Risque (desc)' },
  { value: 'nom',           label: 'Nom A→Z' },
];
const RISK_OPTIONS = ['Tous', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CustomerFilters({ filters, onChange }: Props) {
  return (
    <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
      <TextField
        size="small"
        placeholder="Téléphone, nom..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ minWidth: 220 }}
      />

      <TextField
        select size="small" label="Segment"
        value={filters.segment}
        onChange={(e) => onChange({ segment: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        {SEGMENT_OPTIONS.map((s) => <MenuItem key={s} value={s === 'Tous' ? '' : s}>{s}</MenuItem>)}
      </TextField>

      <TextField
        select size="small" label="Wilaya"
        value={filters.wilayaCode}
        onChange={(e) => onChange({ wilayaCode: e.target.value })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Toutes</MenuItem>
        {WILAYAS.map((w) => (
          <MenuItem key={w.code} value={w.code}>{w.code} — {w.name}</MenuItem>
        ))}
      </TextField>

      <TextField
        select size="small" label="Risque"
        value={filters.riskLevel}
        onChange={(e) => onChange({ riskLevel: e.target.value })}
        sx={{ minWidth: 120 }}
      >
        {RISK_OPTIONS.map((r) => <MenuItem key={r} value={r === 'Tous' ? '' : r}>{r}</MenuItem>)}
      </TextField>

      <TextField
        select size="small" label="Trier par"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        sx={{ minWidth: 200 }}
      >
        {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </TextField>
    </Box>
  );
}
