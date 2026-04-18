'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { alpha, useTheme } from '@mui/material/styles';

type CatalogueFiltersProps = {
  advancedOpen: boolean;
  categoryOptions: string[];
  currentParams: Record<string, string>;
  onExportClick: () => void;
  onParamsChange: (patch: Record<string, string>) => void;
  onRefresh: () => void;
  onReset: () => void;
  onToggleAdvanced: () => void;
  statusCounts: Record<string, number>;
  totalCount: number;
};

type FilterDropdownProps = {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  sx?: object;
  value: string;
};

const STOCK_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'en-stock', label: 'En stock' },
  { value: 'faible', label: 'Faible' },
  { value: 'rupture', label: 'Rupture' },
  { value: 'indisponible', label: 'Aucun stock' },
];

const CHANNEL_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'website', label: 'Site Web' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function CatalogueFilters({
  advancedOpen,
  categoryOptions,
  currentParams,
  onExportClick,
  onParamsChange,
  onRefresh,
  onReset,
  onToggleAdvanced,
  statusCounts,
  totalCount,
}: CatalogueFiltersProps) {
  const [search, setSearch] = useState(currentParams.search ?? '');
  const [draft, setDraft] = useState(() => ({
    category: currentParams.category ?? '',
    channel: currentParams.channel ?? '',
    maxPrice: currentParams.maxPrice ?? '',
    minPrice: currentParams.minPrice ?? '',
    stockStatus: currentParams.stockStatus ?? '',
  }));

  const statusOptions = useMemo(
    () => [
      { value: '', label: `Tous les statuts (${totalCount})` },
      { value: 'published', label: `Publies (${statusCounts.published ?? 0})` },
      { value: 'partial', label: `Partiels (${statusCounts.partial ?? 0})` },
      { value: 'draft', label: `Non publies (${statusCounts.draft ?? 0})` },
      { value: 'scheduled', label: `Planifies (${statusCounts.scheduled ?? 0})` },
      { value: 'masked', label: `Masques auto (${statusCounts.masked ?? 0})` },
    ],
    [statusCounts.draft, statusCounts.masked, statusCounts.partial, statusCounts.published, statusCounts.scheduled, totalCount],
  );

  useEffect(() => {
    setSearch(currentParams.search ?? '');
  }, [currentParams.search]);

  useEffect(() => {
    setDraft({
      category: currentParams.category ?? '',
      channel: currentParams.channel ?? '',
      maxPrice: currentParams.maxPrice ?? '',
      minPrice: currentParams.minPrice ?? '',
      stockStatus: currentParams.stockStatus ?? '',
    });
  }, [
    currentParams.category,
    currentParams.channel,
    currentParams.maxPrice,
    currentParams.minPrice,
    currentParams.stockStatus,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (currentParams.search ?? '')) {
        onParamsChange({ page: '1', search });
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [currentParams.search, onParamsChange, search]);

  const applyAdvancedFilters = () =>
    onParamsChange({
      ...draft,
      page: '1',
    });

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <Stack spacing={1.75} sx={{ p: 1.5 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          sx={{ flexWrap: { xs: 'nowrap', lg: 'nowrap' } }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.9,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 999,
              bgcolor: 'background.default', // Enforces #0d1117
              flex: '1 1 auto',
              minWidth: 0,
            }}
          >
            <SearchOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
            <InputBase
              fullWidth
              placeholder="Rechercher un produit, SKU, categorie..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ fontSize: '0.92rem', color: 'text.primary' }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flexShrink: 0,
              minWidth: { xs: '100%', lg: 'auto' },
              flexWrap: 'nowrap',
            }}
          >
            <FilterDropdown
              label={`Tous les statuts (${totalCount})`}
              value={currentParams.status ?? ''}
              options={statusOptions}
              onChange={(value) => onParamsChange({ page: '1', status: value })}
              sx={{
                minWidth: { xs: 0, sm: 220 },
                flex: { xs: 1, lg: '0 0 auto' },
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={onToggleAdvanced}
              sx={{
                borderRadius: 999,
                minWidth: 116,
                minHeight: 44,
                borderColor: advancedOpen ? 'primary.main' : 'divider',
                color: advancedOpen ? 'primary.main' : 'text.secondary',
                bgcolor: advancedOpen ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
              }}
            >
              Filtres
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={onExportClick}
              sx={{
                borderRadius: 999,
                minWidth: 116,
                minHeight: 44,
                borderColor: 'divider',
                color: 'text.secondary',
              }}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              onClick={onRefresh}
              sx={{
                minWidth: 44,
                width: 44,
                height: 44,
                borderRadius: 999,
                p: 0,
                borderColor: 'divider',
                color: 'text.secondary',
              }}
            >
              <CachedOutlinedIcon sx={{ fontSize: 20 }} />
            </Button>
          </Stack>
        </Stack>

        {advancedOpen && (
          <>
            <Divider />
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(5, minmax(0, 1fr))',
                  },
                  gap: 1.25,
                }}
              >
                <CompactDropdown
                  label="CATEGORIE"
                  value={draft.category}
                  options={[
                    { value: '', label: 'Toutes' },
                    ...categoryOptions.map((option) => ({ value: option, label: option })),
                  ]}
                  onChange={(value) => setDraft((current) => ({ ...current, category: value }))}
                />
                <CompactDropdown
                  label="STOCK"
                  value={draft.stockStatus}
                  options={STOCK_OPTIONS}
                  onChange={(value) =>
                    setDraft((current) => ({ ...current, stockStatus: value }))
                  }
                />
                <CompactDropdown
                  label="CANAL"
                  value={draft.channel}
                  options={CHANNEL_OPTIONS}
                  onChange={(value) => setDraft((current) => ({ ...current, channel: value }))}
                />
                <CompactInput
                  label="PRIX MIN"
                  value={draft.minPrice}
                  onChange={(value) => setDraft((current) => ({ ...current, minPrice: value }))}
                />
                <CompactInput
                  label="PRIX MAX"
                  value={draft.maxPrice}
                  onChange={(value) => setDraft((current) => ({ ...current, maxPrice: value }))}
                />
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button onClick={onReset} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                  Reinitialiser
                </Button>
                <Button variant="contained" onClick={applyAdvancedFilters} sx={{ borderRadius: 999 }}>
                  Appliquer
                </Button>
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

function FilterDropdown({ label, onChange, options, sx, value }: FilterDropdownProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <Button
        variant="outlined"
        onClick={(event) => setAnchor(event.currentTarget)}
        endIcon={<KeyboardArrowDownOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={{
          borderRadius: 999,
          textTransform: 'none',
          px: 1.75,
          minHeight: 44,
          whiteSpace: 'nowrap',
          justifyContent: 'space-between',
          borderColor: value ? 'primary.main' : 'divider',
          color: value ? 'primary.main' : 'text.primary',
          bgcolor: value ? 'rgba(88, 166, 255, 0.1)' : 'background.paper',
          ...sx,
        }}
      >
        {current?.label ?? label}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 180, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value || '__all__'}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setAnchor(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function CompactDropdown({
  label,
  onChange,
  options,
  value,
}: FilterDropdownProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <Box
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          minWidth: 0,
          px: 1.5,
          py: 0.9,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          cursor: 'pointer',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}
        >
          {label}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: 'text.primary' }}>
            {current?.label ?? label}
          </Typography>
          <KeyboardArrowDownOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
        </Stack>
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 180, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value || '__all__'}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setAnchor(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function CompactInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 122,
        px: 1.5,
        py: 0.7,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <InputBase
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))}
        placeholder="0"
        inputProps={{ inputMode: 'numeric' }}
        sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'text.primary' }}
      />
    </Box>
  );
}
