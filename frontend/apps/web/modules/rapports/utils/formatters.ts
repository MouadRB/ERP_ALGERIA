/**
 * Shared formatting utilities for the Rapports module.
 * Single source of truth — import these instead of redefining per-tab.
 */

// ─── Currency ───────────────────────────────────────────────────────────────

export const fmtDZD = (value: number): string =>
  new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(value);

export const fmtDZDShort = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}Md DA`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M DA`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K DA`;
  return `${value} DA`;
};

// ─── Percentage ─────────────────────────────────────────────────────────────

export const fmtPct = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

export const fmtPctRaw = (value: number): string =>
  `${value.toFixed(1)}%`;

// ─── Deltas (comparison) ────────────────────────────────────────────────────

export const deltaColor = (delta: number): 'success' | 'error' =>
  delta >= 0 ? 'success' : 'error';

export const deltaLabel = (delta: number): string =>
  `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`;

export const deltaPtsLabel = (delta: number): string =>
  `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} pts`;

// ─── Numbers ────────────────────────────────────────────────────────────────

export const fmtNumber = (value: number): string =>
  new Intl.NumberFormat('fr-DZ').format(value);

// ─── Period labels ──────────────────────────────────────────────────────────

export const PERIOD_LABELS: Record<string, string> = {
  today:   "Aujourd'hui",
  '7d':    '7 derniers jours',
  '30d':   '30 derniers jours',
  quarter: 'Ce trimestre',
  year:    'Cette année',
  custom:  'Personnalisé',
};

export const COMPARISON_LABELS: Record<string, string> = {
  today:   'Hier',
  '7d':    'Semaine précédente',
  '30d':   'Mois précédent',
  quarter: 'Trimestre précédent',
  year:    'Année précédente',
  custom:  'Période précédente',
};
