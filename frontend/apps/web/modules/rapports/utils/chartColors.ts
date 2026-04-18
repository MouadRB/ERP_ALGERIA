/**
 * Shared chart color palette for the Rapports module.
 * Ensures visual consistency and no color repetition across charts.
 * GitHub Default Dark palette.
 */

// ─── Semantic (status / severity) ───────────────────────────────────────────

export const STATUS_COLORS = {
  success:  '#2ea043',
  warning:  '#d29922',
  danger:   '#f85149',
  info:     '#58a6ff',
  neutral:  '#8b949e',
} as const;

// ─── Categorical (pie / bar segments — all visually distinct) ───────────────

export const CATEGORICAL = [
  '#58a6ff', // blue
  '#2ea043', // green
  '#fd8c73', // orange
  '#bc8cff', // purple
  '#f85149', // red
  '#39c5cf', // cyan
  '#d29922', // yellow
  '#db61a2', // pink
  '#a371f7', // indigo
  '#3fb950', // emerald
] as const;

// ─── Order status colors ────────────────────────────────────────────────────

export const ORDER_STATUS_COLORS: Record<string, string> = {
  delivered:  '#2ea043',
  livrees:    '#2ea043',
  failed:     '#f85149',
  echecs:     '#f85149',
  cancelled:  '#8b949e',
  annulees:   '#8b949e',
  transit:    '#58a6ff',
  en_cours:   '#58a6ff',
  awaiting:   '#d29922',
  returned:   '#fd8c73',
  retournees: '#fd8c73',
};

export const getOrderStatusColor = (status: string): string =>
  ORDER_STATUS_COLORS[status.toLowerCase()] ?? '#8b949e';

// ─── Module badge colors ────────────────────────────────────────────────────

export const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  OMS:               { bg: 'rgba(88,166,255,0.15)',  text: '#58a6ff' },
  CRM:               { bg: 'rgba(210,153,34,0.15)',  text: '#d29922' },
  PIM:               { bg: 'rgba(219,97,162,0.15)',  text: '#db61a2' },
  Inventaire:        { bg: 'rgba(46,160,67,0.15)',   text: '#2ea043' },
  Catalogue:         { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
  Approvisionnement: { bg: 'rgba(253,140,115,0.15)', text: '#fd8c73' },
  'Multi-module':    { bg: 'rgba(188,140,255,0.15)', text: '#bc8cff' },
};

// ─── KPI card icon colors ───────────────────────────────────────────────────

export const KPI_ICON_COLORS = {
  ca:             { bg: 'rgba(210,153,34,0.15)', icon: '#d29922' },
  commandes:      { bg: 'rgba(88,166,255,0.15)', icon: '#58a6ff' },
  tauxLivraison:  { bg: 'rgba(46,160,67,0.15)',  icon: '#2ea043' },
  stock:          { bg: 'rgba(163,113,247,0.15)',icon: '#a371f7' },
} as const;

// ─── Helper: get color by index with offset ─────────────────────────────────

export const getCategoricalColor = (index: number, offset = 0): string =>
  CATEGORICAL[(index + offset) % CATEGORICAL.length];
