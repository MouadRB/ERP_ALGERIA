/**
 * Shared chart color palette for the Rapports module.
 * Ensures visual consistency and no color repetition across charts.
 */

// ─── Semantic (status / severity) ───────────────────────────────────────────

export const STATUS_COLORS = {
  success:  '#22c55e',
  warning:  '#f59e0b',
  danger:   '#ef4444',
  info:     '#3b82f6',
  neutral:  '#6b7280',
} as const;

// ─── Categorical (pie / bar segments — all visually distinct) ───────────────

export const CATEGORICAL = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#ea580c', // orange-600
  '#9333ea', // purple-600
  '#dc2626', // red-600
  '#0891b2', // cyan-600
  '#ca8a04', // yellow-600
  '#be185d', // pink-700
  '#4f46e5', // indigo-600
  '#059669', // emerald-600
] as const;

// ─── Order status colors ────────────────────────────────────────────────────

export const ORDER_STATUS_COLORS: Record<string, string> = {
  delivered:  '#22c55e',
  livrees:    '#22c55e',
  failed:     '#ef4444',
  echecs:     '#ef4444',
  cancelled:  '#6b7280',
  annulees:   '#6b7280',
  transit:    '#3b82f6',
  en_cours:   '#3b82f6',
  awaiting:   '#f59e0b',
  returned:   '#f97316',
  retournees: '#f97316',
};

export const getOrderStatusColor = (status: string): string =>
  ORDER_STATUS_COLORS[status.toLowerCase()] ?? '#6b7280';

// ─── Module badge colors ────────────────────────────────────────────────────

export const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  OMS:               { bg: '#dbeafe', text: '#1d4ed8' },
  CRM:               { bg: '#fef3c7', text: '#b45309' },
  PIM:               { bg: '#fce7f3', text: '#be185d' },
  Inventaire:        { bg: '#d1fae5', text: '#047857' },
  Catalogue:         { bg: '#e0e7ff', text: '#4338ca' },
  Approvisionnement: { bg: '#ffedd5', text: '#c2410c' },
  'Multi-module':    { bg: '#f3e8ff', text: '#7c3aed' },
};

// ─── KPI card icon colors ───────────────────────────────────────────────────

export const KPI_ICON_COLORS = {
  ca:             { bg: '#fef3c7', icon: '#f59e0b' },
  commandes:      { bg: '#dbeafe', icon: '#3b82f6' },
  tauxLivraison:  { bg: '#d1fae5', icon: '#22c55e' },
  stock:          { bg: '#e0e7ff', icon: '#6366f1' },
} as const;

// ─── Helper: get color by index with offset ─────────────────────────────────

export const getCategoricalColor = (index: number, offset = 0): string =>
  CATEGORICAL[(index + offset) % CATEGORICAL.length];
