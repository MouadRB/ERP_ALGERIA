'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon      from '@mui/icons-material/Close';

/* â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const RISK_LEVELS = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Ã‰levÃ©' },
];

const SOURCE_OPTIONS = [
  'Saisie manuelle',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Appel tÃ©lÃ©phonique',
];

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export interface AdvancedFilters {
  dateFrom: string | null;
  dateTo: string | null;
  codMin: number | null;
  codMax: number | null;
  riskLevel: string[];
  source: string[];
  attempts: number | null;
  hasCarrier: boolean | null;
}

interface AdvancedFiltersDrawerProps {
  open:     boolean;
  onClose:  () => void;
  onApply:  (filters: AdvancedFilters) => void;
}

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function AdvancedFiltersDrawer({ open, onClose, onApply }: AdvancedFiltersDrawerProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [codMin, setCodMin] = useState('');
  const [codMax, setCodMax] = useState('');
  const [riskLevel, setRiskLevel] = useState<string[]>([]);
  const [source, setSource] = useState<string[]>([]);
  const [attempts, setAttempts] = useState('');
  const [hasCarrier, setHasCarrier] = useState('');

  const toNumber = (value: string) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const handleApply = () => {
    onApply({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      codMin: codMin !== '' ? toNumber(codMin) : null,
      codMax: codMax !== '' ? toNumber(codMax) : null,
      riskLevel,
      source,
      attempts: attempts !== '' ? toNumber(attempts) : null,
      hasCarrier: hasCarrier === '' ? null : hasCarrier === 'true',
    });
    onClose();
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setCodMin('');
    setCodMax('');
    setRiskLevel([]);
    setSource([]);
    setAttempts('');
    setHasCarrier('');
    onApply({
      dateFrom: null,
      dateTo: null,
      codMin: null,
      codMax: null,
      riskLevel: [],
      source: [],
      attempts: null,
      hasCarrier: null,
    });
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width:    360,
          p:        3,
          display:  'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography fontWeight={700} fontSize={16}>
            Filtres avancÃ©s
          </Typography>
        </Box>
        <CloseIcon
          sx={{ fontSize: 20, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
          onClick={onClose}
        />
      </Box>

      {/* â”€â”€ Date range â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Typography
        sx={{
          fontSize:      11,
          fontWeight:    700,
          color:         'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          mb:            1,
        }}
      >
        PÃ©riode
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          label="Du"
          type="date"
          size="small"
          fullWidth
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
        />
        <TextField
          label="Au"
          type="date"
          size="small"
          fullWidth
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
        />
      </Stack>

      {/* â”€â”€ COD amount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Typography
        sx={{
          fontSize:      11,
          fontWeight:    700,
          color:         'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          mb:            1,
        }}
      >
        Montant COD
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          label="Min"
          type="number"
          size="small"
          fullWidth
          value={codMin}
          onChange={(e) => setCodMin(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
        />
        <TextField
          label="Max"
          type="number"
          size="small"
          fullWidth
          value={codMax}
          onChange={(e) => setCodMax(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}
        />
      </Stack>

      {/* â”€â”€ Risk level â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Typography
        sx={{
          fontSize:      11,
          fontWeight:    700,
          color:         'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          mb:            1,
        }}
      >
        Niveau de risque
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <Select
          multiple
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value as string[])}
          renderValue={(selected) =>
            (selected as string[]).length > 0
              ? (selected as string[])
                .map((v) => RISK_LEVELS.find((r) => r.value === v)?.label ?? v)
                .join(', ')
              : 'Tous niveaux'
          }
          sx={{ borderRadius: 2, fontSize: 13 }}
        >
          {RISK_LEVELS.map((r) => (
            <MenuItem key={r.value} value={r.value} sx={{ fontSize: 13 }}>
              <Checkbox size="small" checked={riskLevel.includes(r.value)} />
              <ListItemText primary={r.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* â”€â”€ Source â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Typography
        sx={{
          fontSize:      11,
          fontWeight:    700,
          color:         'text.secondary',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          mb:            1,
        }}
      >
        Source
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <Select
          multiple
          value={source}
          onChange={(e) => setSource(e.target.value as string[])}
          renderValue={(selected) =>
            (selected as string[]).length > 0
              ? (selected as string[]).join(', ')
              : 'Toutes sources'
          }
          sx={{ borderRadius: 2, fontSize: 13 }}
        >
          {SOURCE_OPTIONS.map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
              <Checkbox size="small" checked={source.includes(s)} />
              <ListItemText primary={s} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* â”€â”€ Attempts + carrier toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <Typography
            sx={{
              fontSize:      11,
              fontWeight:    700,
              color:         'text.secondary',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              mb:            1,
            }}
          >
            Tentatives
          </Typography>
          <Select
            value={attempts}
            onChange={(e) => setAttempts(e.target.value)}
            displayEmpty
            renderValue={(v) => (v ? `${v}` : 'Toutes')}
            sx={{ borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>
              Toutes
            </MenuItem>
            {['0', '1', '2', '3'].map((a) => (
              <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <Typography
            sx={{
              fontSize:      11,
              fontWeight:    700,
              color:         'text.secondary',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              mb:            1,
            }}
          >
            A un carrier
          </Typography>
          <Select
            value={hasCarrier}
            onChange={(e) => setHasCarrier(e.target.value)}
            displayEmpty
            renderValue={(v) =>
              v === ''
                ? 'Tous'
                : v === 'true'
                ? 'Oui'
                : 'Non'
            }
            sx={{ borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>
              Tous
            </MenuItem>
            <MenuItem value="true" sx={{ fontSize: 13 }}>
              Oui
            </MenuItem>
            <MenuItem value="false" sx={{ fontSize: 13 }}>
              Non
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={handleReset}
          sx={{
            textTransform: 'none',
            fontWeight:    600,
            borderRadius:  2,
            fontSize:      13,
          }}
        >
          RÃ©initialiser
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApply}
          sx={{
            textTransform: 'none',
            fontWeight:    600,
            borderRadius:  2,
            fontSize:      13,
            boxShadow:     'none',
            '&:hover':     { boxShadow: 'none' },
          }}
        >
          Appliquer
        </Button>
      </Stack>
    </Drawer>
  );
}
