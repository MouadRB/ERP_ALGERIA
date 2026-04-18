import type { CustomerSegment } from '@ferza/shared';

export const SEGMENT_COLOR: Record<CustomerSegment, string> = {
  'VIP':         '#d29922',
  'Fidèle':      '#58a6ff',
  'Nouveau':     '#2ea043',
  'Inactif':     '#8b949e',
  'A risque':    '#f85149',
  'Liste noire': '#bc8cff',
};

export const SEGMENT_BG: Record<CustomerSegment, string> = {
  'VIP':         'rgba(210,153,34,0.15)',
  'Fidèle':      'rgba(88,166,255,0.15)',
  'Nouveau':     'rgba(46,160,67,0.15)',
  'Inactif':     'rgba(139,148,158,0.15)',
  'A risque':    'rgba(248,81,73,0.15)',
  'Liste noire': 'rgba(188,140,255,0.15)',
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
  LOW:      '#2ea043',
  MEDIUM:   '#d29922',
  HIGH:     '#f85149',
  CRITICAL: '#bc8cff',
};
