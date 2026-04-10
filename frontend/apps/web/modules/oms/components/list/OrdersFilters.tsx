'use client';

import {
  Box,
  Checkbox,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon          from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon           from '@mui/icons-material/Check';
import { useState }        from 'react';
import type { OrderState } from '@ferza/shared';
import { getWilayaByCode } from '@ferza/shared';
import { STATUS_LABEL }    from '@/modules/oms/components/queue/OrderStatusChip';

// ─── Filter types ─────────────────────────────────────────────────────────────

export type DateFilter = 'all' | 'today' | 'yesterday' | '7days' | '30days';
export type SortFilter = 'date_desc' | 'montant' | 'statut' | 'wilaya';

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all',       label: 'Toutes les dates'   },
  { value: '30days',    label: '30 derniers jours'  },
  { value: '7days',     label: '7 derniers jours'   },
  { value: 'yesterday', label: 'Hier'               },
  { value: 'today',     label: "Aujourd'hui"        },
];

const SORT_OPTIONS: { value: SortFilter; label: string }[] = [
  { value: 'date_desc', label: 'Date desc'  },
  { value: 'montant',   label: 'Montant'    },
  { value: 'statut',    label: 'Statut'     },
  { value: 'wilaya',    label: 'Wilaya'     },
];

// Status options relevant for filtering
const STATUS_OPTIONS: { value: OrderState; fr: string }[] = [
  { value: 'AwaitingValidation',     fr: 'En attente'           },
  { value: 'Confirmed',              fr: 'Confirmée'             },
  { value: 'AwaitingPickup',         fr: 'Att. enlèvement'      },
  { value: 'HandedToCarrier',        fr: 'Chez carrier'          },
  { value: 'OutForDelivery',         fr: 'En livraison'          },
  { value: 'DeliveredCOD_Confirmed', fr: 'Livré'                 },
  { value: 'COD_Remitted',           fr: 'COD remis'             },
  { value: 'DeliveryFailed_Absent',  fr: 'Echec livraison'       },
  { value: 'ReturnInTransit_Refused',fr: 'Retour en transit'     },
  { value: 'LostInTransit',          fr: 'Perdue en transit'     },
  { value: 'Returned',               fr: 'Retournée'             },
  { value: 'Cancelled',              fr: 'Annulée'               },
];

const CARRIER_OPTIONS = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OrderFilters {
  search:  string;
  status:  OrderState | '';
  carrier: string;
  wilaya:  string;
  date:    DateFilter;
  sort:    SortFilter;
}

type Props = {
  filters:    OrderFilters;
  wilayas:    string[];        // unique wilaya codes present in the data
  onSearch:   (v: string) => void;
  onStatus:   (v: OrderState | '') => void;
  onCarrier:  (v: string) => void;
  onWilaya:   (v: string) => void;
  onDate:     (v: DateFilter) => void;
  onSort:     (v: SortFilter) => void;
  totalShown: number;
  totalAll:   number;
};

// ─── Dropdown helper ──────────────────────────────────────────────────────────

type DropdownProps<T extends string> = {
  label:    string;
  value:    T;
  options:  { value: T; label: string }[];
  onChange: (v: T) => void;
  minWidth?: number;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  minWidth = 160,
}: DropdownProps<T>) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchor);
  const activeLabel = options.find((o) => o.value === value)?.label ?? label;
  const isActive = value !== options[0]?.value;

  return (
    <>
      <Box
        component="button"
        onClick={(e) => setAnchor(e.currentTarget as HTMLElement)}
        sx={{
          display:         'flex',
          alignItems:      'center',
          gap:             0.5,
          px:              1.5,
          py:              0.7,
          border:          '1px solid',
          borderColor:     isActive ? 'primary.main' : 'divider',
          borderRadius:    1.5,
          background:      isActive ? 'rgba(13,71,161,0.04)' : 'background.paper',
          cursor:          'pointer',
          whiteSpace:      'nowrap',
          fontSize:        13,
          fontWeight:      isActive ? 600 : 400,
          color:           isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            borderColor: 'primary.main',
            color:       'primary.main',
          },
        }}
      >
        {activeLabel}
        <KeyboardArrowDownIcon sx={{ fontSize: 15, opacity: 0.7 }} />
      </Box>

      <Menu
        anchorEl={anchor}
        open={isOpen}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              mt:        0.5,
              minWidth,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              borderRadius: 1.5,
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => { onChange(opt.value); setAnchor(null); }}
            sx={{ fontSize: 13, py: 0.75, minHeight: 36 }}
          >
            {opt.value === value ? (
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckIcon sx={{ fontSize: 15, color: 'primary.main' }} />
              </ListItemIcon>
            ) : (
              <Box sx={{ minWidth: 28 }} />
            )}
            <ListItemText
              primary={opt.label}
              primaryTypographyProps={{
                fontSize: 13,
                fontWeight: opt.value === value ? 600 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersFilters({
  filters,
  wilayas,
  onSearch,
  onStatus,
  onCarrier,
  onWilaya,
  onDate,
  onSort,
  totalShown,
  totalAll,
}: Props) {
  // Build wilaya options from actual data
  const wilayaOptions = [
    { value: '', label: 'Toutes wilayas' },
    ...wilayas.map((code) => ({
      value: code,
      label: `${getWilayaByCode(code)?.name ?? code} (${code})`,
    })),
  ];

  const statusOptions = [
    { value: '' as const, label: 'Tous les statuts' },
    ...STATUS_OPTIONS.map((s) => ({
      value: s.value,
      label: s.fr,
    })),
  ];

  const carrierOptions = [
    { value: '', label: 'Tous carriers' },
    ...CARRIER_OPTIONS.map((c) => ({ value: c, label: c })),
  ];

  return (
    <Box mb={1.5}>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        flexWrap="wrap"
      >
        {/* ── Search ────────────────────────────────────── */}
        <TextField
          size="small"
          placeholder="Rechercher #commande, telephone, nom, SKU..."
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex:     '1 1 280px',
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize:     13,
            },
            '& .MuiInputBase-input::placeholder': {
              color:   'text.disabled',
              opacity: 1,
            },
          }}
        />

        {/* ── Status ────────────────────────────────────── */}
        <FilterDropdown
          label="Tous les statuts"
          value={filters.status}
          options={statusOptions as { value: OrderState | ''; label: string }[]}
          onChange={onStatus}
          minWidth={180}
        />

        {/* ── Carrier ───────────────────────────────────── */}
        <FilterDropdown
          label="Tous carriers"
          value={filters.carrier}
          options={carrierOptions}
          onChange={onCarrier}
          minWidth={150}
        />

        {/* ── Wilaya ────────────────────────────────────── */}
        <FilterDropdown
          label="Toutes wilayas"
          value={filters.wilaya}
          options={wilayaOptions}
          onChange={onWilaya}
          minWidth={160}
        />

        {/* ── Date ──────────────────────────────────────── */}
        <FilterDropdown
          label="30 derniers jours"
          value={filters.date}
          options={DATE_OPTIONS}
          onChange={onDate}
          minWidth={170}
        />

        {/* ── Sort ──────────────────────────────────────── */}
        <Box display="flex" alignItems="center" gap={0.75} sx={{ ml: 'auto' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            Tri:
          </Typography>
          <FilterDropdown
            label="Date desc"
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={onSort}
            minWidth={140}
          />
        </Box>
      </Box>

      {/* Result count */}
      {(filters.search || filters.status || filters.carrier || filters.wilaya) && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: 11, display: 'block', mt: 0.75 }}
        >
          {totalShown} résultat{totalShown !== 1 ? 's' : ''} sur {totalAll}
        </Typography>
      )}
    </Box>
  );
}
