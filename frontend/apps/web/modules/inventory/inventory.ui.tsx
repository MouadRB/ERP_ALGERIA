import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import NorthRoundedIcon from '@mui/icons-material/NorthRounded';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import type { SvgIconComponent } from '@mui/icons-material';

const VISUALS = [
  { end: '#58a6ff', start: '#58a6ff' },
  { end: '#fd8c73', start: '#fd8c73' },
  { end: '#2ea043', start: '#2ea043' },
  { end: '#bc8cff', start: '#bc8cff' },
  { end: '#d29922', start: '#d29922' },
  { end: '#db61a2', start: '#db61a2' },
];

const PHOTO_POOLS = {
  default: [
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=420&q=80',
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=420&q=80',
  ],
  dresses: [
    'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=420&q=80',
  ],
  phones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=420&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=420&q=80',
  ],
  watches: [
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=420&q=80',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=420&q=80',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=420&q=80',
  ],
} as const;

type Meta = {
  bg: string;
  fg: string;
  label: string;
};

export const formatDZD = (value: number) => `${value.toLocaleString('fr-DZ')} DZD`;

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    notation: value >= 1000000 ? 'compact' : 'standard',
  }).format(value);

export const getInventoryVisual = (seed: string) => {
  const index =
    seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % VISUALS.length;
  return VISUALS[index];
};

export const getInventoryThumbnail = (name: string, seed: string) => {
  const text = `${name} ${seed}`.toLowerCase();
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const includesAny = (terms: string[]) => terms.some((term) => text.includes(term));

  let pool: readonly string[] = PHOTO_POOLS.default;
  if (includesAny(['nike', 'adidas', 'shoe', 'chaussure', 'basket', 'air max', 'running'])) {
    pool = PHOTO_POOLS.shoes;
  } else if (includesAny(['robe', 'dress', 'mode', 'taille', 'collection'])) {
    pool = PHOTO_POOLS.dresses;
  } else if (includesAny(['samsung', 'xiaomi', 'redmi', 'iphone', 'galaxy', 'phone'])) {
    pool = PHOTO_POOLS.phones;
  } else if (includesAny(['airpods', 'buds', 'casque', 'headphone'])) {
    pool = PHOTO_POOLS.audio;
  } else if (includesAny(['casio', 'montre', 'watch', 'g-shock'])) {
    pool = PHOTO_POOLS.watches;
  } else if (includesAny(['parfum', 'perfume', 'oud', 'beaute', 'cosmetic'])) {
    pool = PHOTO_POOLS.beauty;
  }

  return pool[hash % pool.length];
};

export const getStockMeta = ({
  quantityAvailable,
  reorderPoint,
}: {
  quantityAvailable: number;
  reorderPoint: number;
}): Meta => {
  if (quantityAvailable <= 0) {
    return { label: 'Rupture', bg: 'rgba(248,81,73,0.15)', fg: '#f85149' };
  }

  if (quantityAvailable <= reorderPoint) {
    return { label: 'Stock Faible', bg: 'rgba(210,153,34,0.15)', fg: '#d29922' };
  }

  return { label: 'En Stock', bg: 'rgba(46,160,67,0.15)', fg: '#2ea043' };
};

export const getMovementMeta = (type: string): { color: string; icon: SvgIconComponent; label: string; soft: string } => {
  switch (type) {
    case 'receipt':
      return { color: 'success.main', icon: Inventory2OutlinedIcon, label: 'Reception', soft: 'rgba(46,160,67,0.15)' };
    case 'reservation-soft':
      return { color: '#bc8cff', icon: LockOutlinedIcon, label: 'Reservation Soft', soft: 'rgba(188,140,255,0.15)' };
    case 'reservation-upgrade':
      return { color: 'primary.main', icon: NorthRoundedIcon, label: 'Soft->Hard', soft: 'rgba(88,166,255,0.15)' };
    case 'sale':
      return { color: 'error.main', icon: LocalShippingOutlinedIcon, label: 'Sortie', soft: 'rgba(248,81,73,0.15)' };
    case 'quarantine':
    case 'return':
      return { color: 'warning.main', icon: ReplayOutlinedIcon, label: 'Retour Client', soft: 'rgba(210,153,34,0.15)' };
    case 'return-approved':
      return { color: 'success.main', icon: ReplayOutlinedIcon, label: 'Retour Approuve', soft: 'rgba(46,160,67,0.15)' };
    case 'return-rejected':
      return { color: 'error.main', icon: ReplayOutlinedIcon, label: 'Retour Rejete', soft: 'rgba(248,81,73,0.15)' };
    default:
      return { color: 'warning.main', icon: WarningAmberRoundedIcon, label: 'Mouvement', soft: 'rgba(210,153,34,0.15)' };
  }
};

export const relativeTime = (dateIso: string) => {
  const date = new Date(dateIso);
  const diffMinutes = Math.max(Math.round((Date.now() - date.getTime()) / 60000), 0);

  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
};
