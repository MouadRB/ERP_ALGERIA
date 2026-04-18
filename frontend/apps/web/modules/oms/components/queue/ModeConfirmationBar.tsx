'use client';

import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | 'expiration'
  | 'montant'
  | 'wilaya';

const SORT_LABELS: Record<SortOption, string> = {
  expiration: 'Tri: Expiration imminente',
  montant:    'Tri: Montant',
  wilaya:     'Tri: Wilaya',
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  total:          number;
  selectedCount:  number;
  sortValue:      SortOption;
  onSortChange:   (v: SortOption) => void;
  onConfirmAll:   () => void;
  onIgnoreAll:    () => void;
  onCancelAll:    () => void;
  isConfirming:   boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModeConfirmationBar({
  total,
  selectedCount,
  sortValue,
  onSortChange,
  onConfirmAll,
  onIgnoreAll,
  onCancelAll,
  isConfirming,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.5}
      px={2}
      py={1.25}
      sx={{
        backgroundColor: '#0D2137',
        borderRadius:    '8px 8px 0 0',
        flexWrap:        'wrap',
      }}
    >
      {/* ── Left: mode label + count ───────────────────────── */}
      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
        <PhoneInTalkIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.85)' }} />
        <Typography
          sx={{
            color:      '#fff',
            fontWeight: 700,
            fontSize:   13,
            whiteSpace: 'nowrap',
          }}
        >
          Mode Confirmation
        </Typography>

        <Box
          sx={{
            width:           1,
            height:          16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            mx:              0.5,
          }}
        />

        <Typography
          sx={{
            color:      'rgba(255,255,255,0.7)',
            fontSize:   13,
            whiteSpace: 'nowrap',
          }}
        >
          {total} commande{total !== 1 ? 's' : ''} en attente
        </Typography>
      </Box>

      {/* ── Sort dropdown ──────────────────────────────────── */}
      <Button
        size="small"
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 15 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color:           'rgba(255,255,255,0.9)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border:          '1px solid rgba(255,255,255,0.15)',
          borderRadius:    1.5,
          fontSize:        12,
          fontWeight:      500,
          textTransform:   'none',
          px:              1.5,
          py:              0.5,
          whiteSpace:      'nowrap',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.16)',
          },
        }}
      >
        {SORT_LABELS[sortValue]}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt:     0.5,
              minWidth: 200,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              borderRadius: 1.5,
            },
          },
        }}
      >
        {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
          ([value, label]) => (
            <MenuItem
              key={value}
              onClick={() => {
                onSortChange(value);
                setAnchorEl(null);
              }}
              sx={{ fontSize: 13, py: 0.75 }}
            >
              {sortValue === value && (
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                </ListItemIcon>
              )}
              <ListItemText
                inset={sortValue !== value}
                primary={label}
                primaryTypographyProps={{ fontSize: 13 }}
              />
            </MenuItem>
          ),
        )}
      </Menu>

      {/* ── Spacer ─────────────────────────────────────────── */}
      <Box flexGrow={1} />

      {/* ── Action buttons ─────────────────────────────────── */}
      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
        <Button
          size="small"
          disabled={selectedCount === 0 || isConfirming}
          onClick={onConfirmAll}
          sx={{
            color:        'rgba(255,255,255,0.9)',
            border:       '1px solid rgba(255,255,255,0.5)',
            borderRadius: 1.5,
            fontSize:     12,
            fontWeight:   600,
            textTransform: 'none',
            px:            1.75,
            py:            0.5,
            whiteSpace:    'nowrap',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor:     'rgba(255,255,255,0.8)',
            },
            '&.Mui-disabled': {
              color:       'rgba(255,255,255,0.35)',
              borderColor: 'rgba(255,255,255,0.15)',
            },
          }}
        >
          Confirmer sélection
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>

        <Button
          size="small"
          disabled={selectedCount === 0}
          onClick={onIgnoreAll}
          sx={{
            color: 'warning.main',
            border:       '1px solid rgba(255,138,0,0.6)',
            borderRadius: 1.5,
            fontSize:     12,
            fontWeight:   600,
            textTransform: 'none',
            px:            1.75,
            py:            0.5,
            whiteSpace:    'nowrap',
            '&:hover': {
              backgroundColor: 'rgba(255,138,0,0.08)',
              borderColor:     '#d29922',
            },
            '&.Mui-disabled': {
              color:       'rgba(255,138,0,0.35)',
              borderColor: 'rgba(255,138,0,0.2)',
            },
          }}
        >
          Ignorer sélection
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>

        <Button
          size="small"
          disabled={selectedCount === 0}
          onClick={onCancelAll}
          sx={{
            color:        '#f44336',
            border:       '1px solid rgba(244,67,54,0.6)',
            borderRadius: 1.5,
            fontSize:     12,
            fontWeight:   600,
            textTransform: 'none',
            px:            1.75,
            py:            0.5,
            whiteSpace:    'nowrap',
            '&:hover': {
              backgroundColor: 'rgba(244,67,54,0.08)',
              borderColor:     '#f44336',
            },
            '&.Mui-disabled': {
              color:       'rgba(244,67,54,0.35)',
              borderColor: 'rgba(244,67,54,0.2)',
            },
          }}
        >
          Annuler sélection
          {selectedCount > 0 && ` (${selectedCount})`}
        </Button>
      </Box>
    </Box>
  );
}