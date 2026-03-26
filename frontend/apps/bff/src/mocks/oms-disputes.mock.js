// oms-disputes.mock.js
// Each orderId MUST reference an order whose status is consistent with the
// litige scenario. Rule R3 (referential integrity): the service reads the
// live order status at display time — so the order's status in oms-orders.mock.js
// is the authoritative truth.
//
// From STATUS_PLAN (buildOrder index → id):
//   DeliveredCOD_Confirmed: idx 30→ord-2025-00031 … idx 35→ord-2025-00036
//   COD_Remitted:           idx 36→ord-2025-00037,  idx 37→ord-2025-00038
//
// Litiges scenarios and required order statuses:
//   lit-001 — "Client affirme avoir reçu un produit différent"
//             → order must be DeliveredCOD_Confirmed (product was actually delivered)
//   lit-002 — "Colis arrivé endommagé — photos client reçues"
//             → order must be DeliveredCOD_Confirmed (package arrived but damaged)
//   lit-003 — "Montant COD incorrect encaissé"
//             → order must be COD_Remitted (COD was collected and remitted)

module.exports = [
  {
    id: 'lit-001',
    orderId: 'ord-2025-00031',          // DeliveredCOD_Confirmed (idx 30, Ecotrack)
    severity: 'high',
    description: 'Client affirme avoir reçu un produit différent de la commande',
    openedAt: '2026-03-22T10:00:00Z',
    status: 'En attente carrier',
    statusKey: 'attente_carrier',
    assignedTo: 'CRM Agent',
    actionLabel: 'Contacter client',
  },
  {
    id: 'lit-002',
    orderId: 'ord-2025-00033',          // DeliveredCOD_Confirmed (idx 32, Yalidine)
    severity: 'medium',
    description: 'Colis arrivé endommagé — photos client reçues',
    openedAt: '2026-03-19T14:00:00Z',
    status: 'En attente carrier',
    statusKey: 'attente_carrier',
    assignedTo: null,
    actionLabel: 'Contacter Yalidine',
  },
  {
    id: 'lit-003',
    orderId: 'ord-2025-00037',          // COD_Remitted (idx 36, Yalidine)
    severity: 'medium',
    description: 'Montant COD incorrect encaissé (12 500 vs 12 000 DZD)',
    openedAt: '2026-03-17T09:00:00Z',
    status: 'Finance notifié',
    statusKey: 'finance_notifie',
    assignedTo: 'Finance Director',
    actionLabel: 'Contacter client',
  },
];
