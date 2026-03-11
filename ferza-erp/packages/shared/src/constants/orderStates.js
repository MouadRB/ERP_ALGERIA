export const ORDER_STATES = {
  AWAITING_VALIDATION: 'AWAITING_VALIDATION', CONFIRMED: 'CONFIRMED',
  HANDED_TO_CARRIER: 'HANDED_TO_CARRIER', OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED', FAILED_DELIVERY: 'FAILED_DELIVERY',
  RETURNED: 'RETURNED', CANCELLED: 'CANCELLED', PARTIAL_DELIVERY: 'PARTIAL_DELIVERY',
}
export const ORDER_STATE_COLORS = {
  AWAITING_VALIDATION: { bg: '#FEF3C7', text: '#D97706', label: 'En attente' },
  CONFIRMED:           { bg: '#E3F2FD', text: '#0D47A1', label: 'Confirmé' },
  HANDED_TO_CARRIER:   { bg: '#F3E8FF', text: '#7C3AED', label: 'Remis carrier' },
  OUT_FOR_DELIVERY:    { bg: '#E0F7FA', text: '#0097A7', label: 'En livraison' },
  DELIVERED:           { bg: '#DCFCE7', text: '#16A34A', label: 'Livré' },
  FAILED_DELIVERY:     { bg: '#FEE2E2', text: '#DC2626', label: 'Échec livraison' },
  RETURNED:            { bg: '#FEF3C7', text: '#D97706', label: 'Retourné' },
  CANCELLED:           { bg: '#F1F5F9', text: '#64748B', label: 'Annulé' },
  PARTIAL_DELIVERY:    { bg: '#FEF3C7', text: '#D97706', label: 'Livraison partielle' },
}
