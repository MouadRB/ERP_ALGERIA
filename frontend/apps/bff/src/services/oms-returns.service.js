const mockOrders = require('../mocks/oms-orders.mock');
const mockReturns = require('../mocks/oms-returns.mock');
const mockDisputes = require('../mocks/oms-disputes.mock');

function orderRef(order) {
  return order?.reference ? `#${order.reference}` : '#N/A';
}

function defaultWilaya(order) {
  return order?.customer?.wilaya || order?.wilayaCode || 'N/A';
}

function buildRetours() {
  return mockReturns
    .map((ret) => {
      const order = mockOrders.find((o) => o.id === ret.orderId);
      if (!order) return null;
      if (!['ReturnInTransit_Refused', 'Returned'].includes(order.status)) return null;
      if (order.returnOutcome) return null;
    const carrier = order?.carrier ?? order?.tracking?.carrier ?? '—';
    const trackingNumber =
      order?.trackingNumber ??
      order?.tracking?.trackingNumber ??
      '—';
    const produit = ret.produit || order?.items?.[0]?.nameFr || '—';
    const produitQty = ret.produitQty || order?.items?.[0]?.quantity || 1;
    const etatReception =
      ret.etatReceptionKey === 'quarantaine'
        ? 'Recu — Quarantaine'
        : 'En transit retour';

      return {
        id: ret.id,
        orderRef: orderRef(order),
        orderId: ret.orderId,
        customerPhone: order?.customerPhone ?? order?.customer?.phone ?? '—',
        customerNameFr: order?.customerNameFr ?? order?.customer?.nameFr ?? '—',
        produit,
        produitQty,
        carrier,
        trackingNumber,
        raisonRetour: ret.raisonRetour,
        raisonCategory: ret.raisonCategory,
        etatReception,
        etatReceptionKey: ret.etatReceptionKey,
        returnedAt: ret.returnedAt,
        inspectedAt: ret.inspectedAt,
      };
    })
    .filter(Boolean);
}

function buildLitiges() {
  return mockDisputes
    .map((lit) => {
      const order = mockOrders.find((o) => o.id === lit.orderId);
      if (!order) return null;
    const carrier = order?.carrier ?? order?.tracking?.carrier ?? '—';
    const trackingNumber =
      order?.trackingNumber ??
      order?.tracking?.trackingNumber ??
      '—';

      return {
        id: lit.id,
        orderRef: orderRef(order),
        orderId: lit.orderId,
        carrier,
        trackingNumber,
        severity: lit.severity,
        description: lit.description,
        customerPhone: order?.customerPhone ?? order?.customer?.phone ?? '—',
        wilaya: defaultWilaya(order),
        openedAt: lit.openedAt,
        status: lit.status,
        statusKey: lit.statusKey,
        assignedTo: lit.assignedTo,
        actionLabel: lit.actionLabel,
      };
    })
    .filter(Boolean);
}

function getRetours() {
  const retours = buildRetours();
  const litiges = buildLitiges();
  return {
    totalRetours: retours.length,
    totalLitiges: litiges.length,
    retours,
    litiges,
  };
}

module.exports = { getRetours };
