// Procurement Adapter — LIVE data from procurement.mock.
// BC pipeline, supplier stats and alerts are computed from the same list the
// Procurement module itself exposes, keeping rapport dynamic.

const procurementOrders = () => require('../../../mocks/procurement.mock');

const STATUS_PIPELINE = {
  Draft:             'brouillon',
  PendingApproval:   'enAttente',
  Approved:          'approuve',
  InTransit:         'enCours',
  PartiallyReceived: 'enCours',
  Received:          'recu',
};

function daysBetween(a, b) { return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000)); }

async function getProcurementOverview(/* period */) {
  const orders = procurementOrders();

  // ── Pipeline counts ──
  const pipeline = { brouillon: 0, enAttente: 0, approuve: 0, enCours: 0, recu: 0, totalValue: 0 };
  orders.forEach((o) => {
    const bucket = STATUS_PIPELINE[o.status];
    if (bucket) pipeline[bucket] += 1;
    pipeline.totalValue += o.totalTTC || 0;
  });
  const bcPipeline = { total: orders.length, ...pipeline };

  // ── Pending approvals ──
  const now = new Date();
  const pendingApprovals = orders
    .filter((o) => o.status === 'PendingApproval')
    .map((o) => ({
      id:          o.reference || o.id,
      supplier:    o.supplierName,
      value:       o.totalTTC,
      items:       (o.items || []).reduce((s, it) => s + (it.quantityOrdered || 0), 0),
      daysWaiting: daysBetween(o.createdAt, now),
      priority:    daysBetween(o.createdAt, now) >= 3 ? 'haute' : 'normale',
    }));

  // ── Supplier performance (aggregated over all BCs) ──
  const supMap = {};
  orders.forEach((o) => {
    if (!o.supplierName) return;
    if (!supMap[o.supplierName]) supMap[o.supplierName] = { name: o.supplierName, bcCount: 0, onTime: 0, delays: [] };
    const s = supMap[o.supplierName];
    s.bcCount += 1;
    if (o.expectedDeliveryDate && o.updatedAt && (o.status === 'Received' || o.status === 'PartiallyReceived')) {
      const delai = daysBetween(o.createdAt, o.updatedAt);
      s.delays.push(delai);
      if (new Date(o.updatedAt) <= new Date(o.expectedDeliveryDate)) s.onTime += 1;
    }
  });
  const supplierPerformance = Object.values(supMap).map((s) => ({
    name:         s.name,
    bcCount:      s.bcCount,
    onTime:       s.onTime,
    tauxOnTime:   s.bcCount > 0 ? Math.round((s.onTime / s.bcCount) * 1000) / 10 : 0,
    delaiMoyen:   s.delays.length > 0 ? Math.round(s.delays.reduce((a, b) => a + b, 0) / s.delays.length) : null,
    qualityScore: 85,
  }));

  // ── Recent receptions ──
  const receptionRecente = orders
    .filter((o) => o.status === 'Received' || o.status === 'PartiallyReceived')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map((o) => ({
      bcId:       o.reference || o.id,
      supplier:   o.supplierName,
      receivedAt: (o.updatedAt || '').slice(0, 10),
      items:      (o.items || []).reduce((s, it) => s + (it.quantityReceived || 0), 0),
      conformity: (() => {
        const ordered = (o.items || []).reduce((s, it) => s + (it.quantityOrdered || 0), 0);
        const received = (o.items || []).reduce((s, it) => s + (it.quantityReceived || 0), 0);
        return ordered > 0 ? Math.round((received / ordered) * 100) : 0;
      })(),
    }));

  // ── Alerts ──
  const alerts = [];
  const lateBCs = orders.filter((o) =>
    o.expectedDeliveryDate &&
    ['Approved', 'InTransit', 'PartiallyReceived'].includes(o.status) &&
    new Date(o.expectedDeliveryDate) < now,
  );
  lateBCs.forEach((o) => {
    const days = daysBetween(o.expectedDeliveryDate, now);
    alerts.push({ type: 'retard', message: `${o.reference || o.id} (${o.supplierName}) en retard de ${days} jours`, severity: days > 5 ? 'haute' : 'moyenne' });
  });
  const rejectedCount = orders.filter((o) => o.status === 'Rejected').length;
  if (rejectedCount > 0) alerts.push({ type: 'budget', message: `${rejectedCount} BC rejete(s) - revoir les plafonds`, severity: 'moyenne' });

  return {
    bcPipeline,
    pendingApprovals,
    supplierPerformance,
    receptionRecente,
    alerts,
  };
}

module.exports = { getProcurementOverview };
