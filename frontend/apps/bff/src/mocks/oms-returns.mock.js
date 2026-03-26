// oms-returns.mock.js
// Each orderId MUST reference an order in oms-orders.mock.js whose status is
// 'ReturnInTransit_Refused' or 'Returned'. The service layer enforces this constraint.
//
// From STATUS_PLAN (buildOrder index → id):
//   ReturnInTransit_Refused: idx 41→ord-2025-00042, idx 42→ord-2025-00043
//   Returned:                idx 44→ord-2025-00045, idx 45→ord-2025-00046

module.exports = [
  {
    id: 'ret-001',
    orderId: 'ord-2025-00045',          // Returned (idx 44, Yalidine)
    raisonCategory: 'refus_prix',
    raisonRetour: 'Client refuse — prix trop élevé',
    etatReceptionKey: 'quarantaine',    // Received at warehouse, pending inspection
    returnedAt: '2026-03-22T14:30:00Z',
    inspectedAt: null,
    produit: null,                      // resolved from order items by service
    produitQty: null,
  },
  {
    id: 'ret-002',
    orderId: 'ord-2025-00042',          // ReturnInTransit_Refused (idx 41, Maystro)
    raisonCategory: 'mauvaise_taille',
    raisonRetour: 'Mauvaise taille',
    etatReceptionKey: 'transit',        // Still in transit back to warehouse
    returnedAt: '2026-03-21T09:15:00Z',
    inspectedAt: null,
    produit: null,
    produitQty: null,
  },
  {
    id: 'ret-003',
    orderId: 'ord-2025-00046',          // Returned (idx 45, Maystro)
    raisonCategory: 'endommage',
    raisonRetour: 'Produit endommagé à la livraison',
    etatReceptionKey: 'quarantaine',
    returnedAt: '2026-03-20T16:00:00Z',
    inspectedAt: null,
    produit: null,
    produitQty: null,
  },
  {
    id: 'ret-004',
    orderId: 'ord-2025-00043',          // ReturnInTransit_Refused (idx 42, Ecotrack)
    raisonCategory: 'absent_x3',
    raisonRetour: 'Client absent — 3 tentatives échouées',
    etatReceptionKey: 'transit',
    returnedAt: '2026-03-19T11:30:00Z',
    inspectedAt: null,
    produit: null,
    produitQty: null,
  },
];
