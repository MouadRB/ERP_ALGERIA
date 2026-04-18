import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import type { CatalogueStatus, CatalogueStockStatus } from './catalogue.types';

type BadgeMeta = {
  bg: string;
  fg: string;
  label: string;
};

type ChannelMeta = {
  bg: string;
  fg: string;
  icon: SvgIconComponent;
  label: string;
  shortLabel: string;
};

const VISUALS = [
  { accent: '#58a6ff', start: '#58a6ff', end: '#58a6ff', soft: 'rgba(88,166,255,0.15)' },
  { accent: '#fd8c73', start: '#fd8c73', end: '#fd8c73', soft: 'rgba(253,140,115,0.15)' },
  { accent: '#bc8cff', start: '#bc8cff', end: '#bc8cff', soft: 'rgba(188,140,255,0.15)' },
  { accent: '#db61a2', start: '#db61a2', end: '#db61a2', soft: 'rgba(219,97,162,0.15)' },
  { accent: '#2ea043', start: '#2ea043', end: '#2ea043', soft: 'rgba(46,160,67,0.15)' },
  { accent: '#39c5cf', start: '#39c5cf', end: '#39c5cf', soft: 'rgba(57,197,207,0.15)' },
];

export const CHANNEL_ORDER = ['website', 'whatsapp'];

export const getCatalogueStatusMeta = (status: CatalogueStatus): BadgeMeta => {
  switch (status) {
    case 'published':
      return { label: 'Publie', bg: 'rgba(46,160,67,0.15)', fg: '#2ea043' };
    case 'scheduled':
      return { label: 'Planifie', bg: 'rgba(188,140,255,0.15)', fg: '#bc8cff' };
    case 'masked':
      return { label: 'Masque Auto.', bg: 'rgba(248,81,73,0.15)', fg: '#f85149' };
    case 'partial':
      return { label: 'Partiel', bg: 'rgba(210,153,34,0.15)', fg: '#d29922' };
    default:
      return { label: 'Non publie', bg: 'rgba(139,148,158,0.15)', fg: '#8b949e' };
  }
};

export const getStockStatusMeta = (status: CatalogueStockStatus): BadgeMeta => {
  switch (status) {
    case 'en-stock':
      return { label: 'En stock', bg: 'rgba(46,160,67,0.15)', fg: '#2ea043' };
    case 'faible':
      return { label: 'Faible', bg: 'rgba(210,153,34,0.15)', fg: '#d29922' };
    case 'rupture':
      return { label: 'Rupture', bg: 'rgba(248,81,73,0.15)', fg: '#f85149' };
    default:
      return { label: 'Indispo', bg: 'rgba(139,148,158,0.15)', fg: '#8b949e' };
  }
};

export const getChannelMeta = (channel: string): ChannelMeta => {
  switch (channel) {
    case 'whatsapp':
      return {
        label: 'WhatsApp Business',
        shortLabel: 'WA',
        icon: ChatOutlinedIcon,
        bg: 'rgba(46,160,67,0.15)',
        fg: '#2ea043',
      };
    case 'website':
    default:
      return {
        label: 'Site Web',
        shortLabel: 'WEB',
        icon: StorefrontOutlinedIcon,
        bg: 'rgba(88,166,255,0.15)',
        fg: '#58a6ff',
      };
  }
};

export const getSearchHealthMeta = (health: 'green' | 'yellow' | 'red') => {
  switch (health) {
    case 'green':
      return { label: 'En ligne', color: 'success.main' };
    case 'yellow':
      return { label: 'Sync partielle', color: 'warning.main' };
    default:
      return { label: 'Incident', color: 'error.main' };
  }
};

export const getCatalogueVisual = (seed: string) => {
  const index =
    seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % VISUALS.length;
  return VISUALS[index];
};

export const formatDZD = (value: number) =>
  `${value.toLocaleString('fr-DZ')} DZD`;

export const formatPercent = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;

export const getPriceHT = (priceTTC: number, vatRate = 0.19) =>
  Math.round(priceTTC / (1 + vatRate));

export const getHighlightLabel = ({
  conversionRate,
  returnRate,
  status,
}: {
  conversionRate: number;
  returnRate: number;
  status: CatalogueStatus;
}) => {
  if (status === 'scheduled') {
    return 'Campagne';
  }
  if (returnRate >= 0.2) {
    return 'Sous surveillance';
  }
  if (conversionRate >= 0.04) {
    return 'Top vendeur';
  }
  return 'Catalogue';
};

export const SearchHealthIcon = SearchOutlinedIcon;
