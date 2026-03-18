export const CARRIERS = [
  'Yalidine',
  'Maystro',
  'Ecotrack',
  'Procolis',
] as const;

export type Carrier = (typeof CARRIERS)[number];

/**
 * All carriers are treated as unreliable — CSV fallback is always
 * available for manual reconciliation when the carrier API is down.
 */
export const CARRIER_CSV_FALLBACK_ENABLED = true;