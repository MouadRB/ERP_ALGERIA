export const BC_STATES = {
  BROUILLON: 'BROUILLON', EN_ATTENTE_APPROBATION: 'EN_ATTENTE_APPROBATION',
  APPROUVE: 'APPROUVE', ENVOYE_FOURNISSEUR: 'ENVOYE_FOURNISSEUR',
  CONFIRME_FOURNISSEUR: 'CONFIRME_FOURNISSEUR', EN_TRANSIT: 'EN_TRANSIT',
  PARTIELLEMENT_RECU: 'PARTIELLEMENT_RECU', RECEPTIONNE: 'RECEPTIONNE',
  ANNULE: 'ANNULE', LITIGE: 'LITIGE',
}
export const BC_STATE_COLORS = {
  BROUILLON:               { bg: '#F1F5F9', text: '#64748B', label: 'Brouillon' },
  EN_ATTENTE_APPROBATION:  { bg: '#FEF3C7', text: '#D97706', label: 'En attente approbation' },
  APPROUVE:                { bg: '#E3F2FD', text: '#0D47A1', label: 'Approuvé' },
  ENVOYE_FOURNISSEUR:      { bg: '#F3E8FF', text: '#7C3AED', label: 'Envoyé fournisseur' },
  CONFIRME_FOURNISSEUR:    { bg: '#E0F7FA', text: '#0097A7', label: 'Confirmé fournisseur' },
  EN_TRANSIT:              { bg: '#FEF3C7', text: '#D97706', label: 'En transit' },
  PARTIELLEMENT_RECU:      { bg: '#FEF3C7', text: '#D97706', label: 'Partiellement reçu' },
  RECEPTIONNE:             { bg: '#DCFCE7', text: '#16A34A', label: 'Réceptionné' },
  ANNULE:                  { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
  LITIGE:                  { bg: '#FEE2E2', text: '#DC2626', label: 'Litige' },
}
