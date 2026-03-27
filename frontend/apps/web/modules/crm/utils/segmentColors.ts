import type { CustomerSegment } from '@ferza/shared';

export const SEGMENT_COLOR: Record<CustomerSegment, string> = {
  'VIP':         '#E65100',
  'Fidèle':      '#1565C0',
  'Nouveau':     '#2E7D32',
  'Inactif':     '#757575',
  'A risque':    '#C62828',
  'Liste noire': '#4A148C',
};

export const SEGMENT_BG: Record<CustomerSegment, string> = {
  'VIP':         '#FFF3E0',
  'Fidèle':      '#E3F2FD',
  'Nouveau':     '#E8F5E9',
  'Inactif':     '#F5F5F5',
  'A risque':    '#FFEBEE',
  'Liste noire': '#F3E5F5',
};

export const SEGMENT_ICON: Record<CustomerSegment, string> = {
  'VIP':         '👑',
  'Fidèle':      '⭐',
  'Nouveau':     '🟢',
  'Inactif':     '⏸',
  'A risque':    '⚠️',
  'Liste noire': '🚫',
};

export const RISK_COLOR: Record<string, string> = {
  LOW:      '#2E7D32',
  MEDIUM:   '#E65100',
  HIGH:     '#C62828',
  CRITICAL: '#6A1B9A',
};
