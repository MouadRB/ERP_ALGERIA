'use client';

import { useTheme, alpha } from '@mui/material/styles';
import {
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

type StockFiltersProps = {
  categoryId: string;
  categoryOptions: string[];
  onCategoryChange: (value: string) => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  search: string;
  sort: string;
  stockStatus: string;
};

export default function StockFilters({
  categoryId,
  categoryOptions,
  onCategoryChange,
  onReset,
  onSearchChange,
  onSortChange,
  onStockStatusChange,
  search,
  sort,
  stockStatus,
}: StockFiltersProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack
      direction={{ xs: 'column', xl: 'row' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ flex: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher par nom, SKU..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xl: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: isDark ? '#8b949e' : '#afb8c1' },
            },
          }}
        />

        <TextField
          select
          size="small"
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => (value ? String(value) : <Typography color="text.disabled" variant="body2">Catégorie</Typography>),
          }}
          sx={{
            minWidth: 160,
            '& .MuiOutlinedInput-root': { 
              borderRadius: 1.5, 
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: 'divider' },
            },
          }}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          {categoryOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={stockStatus}
          onChange={(event) => onStockStatusChange(event.target.value)}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => {
              const v = value as string;
              if (!v) return <Typography color="text.disabled" variant="body2">Statut</Typography>;
              return v.charAt(0).toUpperCase() + v.slice(1);
            },
          }}
          sx={{
            minWidth: 140,
            '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: 'background.paper' },
          }}
        >
          <MenuItem value="">Tous les statuts</MenuItem>
          <MenuItem value="disponible">En Stock</MenuItem>
          <MenuItem value="faible">Stock Faible</MenuItem>
          <MenuItem value="rupture">Rupture</MenuItem>
        </TextField>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={onReset}
          startIcon={<TuneRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2
          }}
        >
          Filtres
        </Button>
      </Stack>
    </Stack>
  );
}
