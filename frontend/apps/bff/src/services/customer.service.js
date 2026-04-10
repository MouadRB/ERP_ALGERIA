/**
 * customer.service.js
 *
 * CRM is a READ MODEL derived from OMS.
 * All computed metrics (totalOrders, totalSpentTTC, panierMoyen, tauxRetour,
 * tauxAnnulation, deliveredCount, cancelledCount, returnedCount, lastOrder*)
 * are computed here at query time by joining CRM customers with OMS orders.
 *
 * The crm.mock.js stores identity data only — no computed fields.
 */

const env = require('../config/env');
const crmMock = require('../mocks/crm.mock');
const omsMock = require('../mocks/oms-orders.mock');
const { transformCustomer, transformCustomerList } = require('../transformers/crm.transformer');

// ─── Status classification ────────────────────────────────────────────────────

const DELIVERED_STATUSES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const CANCELLED_STATUSES = ['Cancelled'];
const RETURNED_STATUSES  = ['Returned', 'ReturnInTransit_Refused', 'LostInTransit'];

// ─── Metrics computation ──────────────────────────────────────────────────────

/**
 * Compute all CRM metrics for a customer from their OMS orders.
 * Returns a plain object — no side effects.
 */
function computeCustomerMetrics(customerId, allOrders) {
  const orders = allOrders.filter((o) => o.customerId === customerId);
  const totalOrders = orders.length;

  if (!totalOrders) {
    return {
      totalOrders: 0,
      totalSpentTTC: 0,
      panierMoyen: null,
      tauxRetour: null,
      tauxAnnulation: null,
      lastOrderDate: null,
      lastOrderRef: null,
      lastOrderStatus: null,
      deliveredCount: 0,
      cancelledCount: 0,
      returnedCount: 0,
    };
  }

  const deliveredOrders  = orders.filter((o) => DELIVERED_STATUSES.includes(o.status));
  const cancelledOrders  = orders.filter((o) => CANCELLED_STATUSES.includes(o.status));
  const returnedOrders   = orders.filter((o) => RETURNED_STATUSES.includes(o.status));

  const totalSpentTTC = deliveredOrders.reduce((sum, o) => sum + (o.totalTTC || 0), 0);
  const panierMoyen   = deliveredOrders.length > 0
    ? Math.round(totalSpentTTC / deliveredOrders.length)
    : null;

  const tauxRetour      = Math.round((returnedOrders.length / totalOrders) * 100);
  const tauxAnnulation  = Math.round((cancelledOrders.length / totalOrders) * 100);

  const sortedByDate = orders.slice().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const lastOrder = sortedByDate[0];

  return {
    totalOrders,
    totalSpentTTC,
    panierMoyen,
    tauxRetour,
    tauxAnnulation,
    lastOrderDate:   lastOrder.createdAt,
    lastOrderRef:    lastOrder.reference,
    lastOrderStatus: lastOrder.status,
    deliveredCount:  deliveredOrders.length,
    cancelledCount:  cancelledOrders.length,
    returnedCount:   returnedOrders.length,
  };
}

/**
 * Compute the CRM segment for a customer given their stored data + computed metrics.
 * Priority: Liste noire > À risque > Inactif > VIP > Fidèle > Nouveau
 */
function computeSegment(customer, metrics) {
  if (customer.blacklisted) return 'Liste noire';

  const { totalOrders, tauxAnnulation, tauxRetour, lastOrderDate } = metrics;

  if (!totalOrders) return 'Nouveau';

  // À risque: high fraud score or very high cancellation rate
  if ((customer.fraudScore !== null && customer.fraudScore > 60) || tauxAnnulation > 50) {
    return 'A risque';
  }

  // Inactif: last order more than 90 days ago
  if (lastOrderDate) {
    const daysSince = (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 90) return 'Inactif';
  }

  // VIP: 8+ orders, low cancellation (<20%), low return (<15%)
  if (totalOrders >= 8 && tauxAnnulation < 20 && (tauxRetour === null || tauxRetour < 15)) {
    return 'VIP';
  }

  // Fidèle: 3+ orders
  if (totalOrders >= 3) return 'Fidèle';

  return 'Nouveau';
}

/**
 * Compute the risk level from fraudScore (100-scale stored on customer).
 */
function computeRiskLevel(fraudScore) {
  if (fraudScore === null || fraudScore === undefined) return 'LOW';
  if (fraudScore >= 80) return 'CRITICAL';
  if (fraudScore >= 60) return 'HIGH';
  if (fraudScore >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Enrich a single customer with computed metrics + segment.
 */
function enrichCustomer(customer, allOrders) {
  const metrics = computeCustomerMetrics(customer.id, allOrders);
  const segment = computeSegment(customer, metrics);
  return {
    ...customer,
    ...metrics,
    segment,
    riskLevel: computeRiskLevel(customer.fraudScore),
  };
}

// ─── Public service functions ─────────────────────────────────────────────────

const getCustomers = async (params = {}) => {
  if (env.useMock) {
    const { page = 1, pageSize = 20, search, segment, blacklisted, wilayaCode, sort, riskLevel } = params;

    let results = crmMock.map((c) => enrichCustomer(c, omsMock));

    if (blacklisted !== undefined) {
      const flag = blacklisted === 'true' || blacklisted === true;
      results = results.filter((c) => c.blacklisted === flag);
    }
    if (segment && segment !== 'Tous') {
      results = results.filter((c) => c.segment === segment);
    }
    if (wilayaCode && wilayaCode !== 'Toutes') {
      results = results.filter((c) => c.wilayaCode === wilayaCode);
    }
    if (riskLevel) {
      results = results.filter((c) => c.riskLevel === riskLevel);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.phone.includes(q) ||
          c.nameFr.toLowerCase().includes(q) ||
          (c.nameAr && c.nameAr.includes(q)),
      );
    }

    // Sorting
    if (sort === 'ca_desc')           results.sort((a, b) => b.totalSpentTTC - a.totalSpentTTC);
    else if (sort === 'risque_desc')  results.sort((a, b) => (b.fraudScore || 0) - (a.fraudScore || 0));
    else if (sort === 'retour_desc')  results.sort((a, b) => (b.tauxRetour || 0) - (a.tauxRetour || 0));
    else if (sort === 'commandes_desc') results.sort((a, b) => b.totalOrders - a.totalOrders);
    else if (sort === 'nom') results.sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));
    else results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const total = results.length;
    const data  = results.slice((page - 1) * pageSize, page * pageSize);
    return { data, meta: { total, page, pageSize } };
  }

  const res = await fetch(`${env.engineBUrl}/api/customers?page=${params.page || 1}&pageSize=${params.pageSize || 20}`);
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return { data: transformCustomerList(json.data ?? json), meta: json.meta };
};

const getCustomerById = async (id) => {
  if (env.useMock) {
    const customer = crmMock.find((c) => c.id === id);
    if (!customer) return null;
    return enrichCustomer(customer, omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

const createCustomer = async (body) => {
  if (env.useMock) {
    // Idempotent: return existing if phone already registered
    const existing = crmMock.find((c) => c.phone === body.phone);
    if (existing) return enrichCustomer(existing, omsMock);

    const newCustomer = {
      id: `CUST-${String(crmMock.length + 1).padStart(3, '0')}`,
      phone: body.phone,
      phoneSec: null,
      nameFr: body.nameFr || body.nomComplet || 'Nouveau Client',
      nameAr: body.nameAr || '',
      email: body.email || null,
      wilayaCode: body.wilayaCode || '16',
      commune: body.commune || null,
      address: body.address || '',
      blacklisted: false,
      blacklistReason: null,
      blacklistMotif: null,
      blacklistedAt: null,
      blacklistedBy: null,
      preferredChannel: null,
      preferredLanguage: null,
      riskLevel: 'LOW',
      fraudScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    crmMock.push(newCustomer);
    return enrichCustomer(newCustomer, omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

const updateCustomer = async (id, body) => {
  if (env.useMock) {
    const idx = crmMock.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    Object.assign(crmMock[idx], body, { updatedAt: new Date().toISOString() });
    return enrichCustomer(crmMock[idx], omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

const blacklistCustomer = async (id, motif, reason, agentName) => {
  if (env.useMock) {
    const customer = crmMock.find((c) => c.id === id);
    if (!customer) return null;
    Object.assign(customer, {
      blacklisted: true,
      blacklistReason: reason || null,
      blacklistMotif: motif,
      blacklistedAt: new Date().toISOString(),
      blacklistedBy: agentName || 'CRM Agent',
      updatedAt: new Date().toISOString(),
    });
    return enrichCustomer(customer, omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}/blacklist`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motif, reason }),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

const removeFromBlacklist = async (id) => {
  if (env.useMock) {
    const customer = crmMock.find((c) => c.id === id);
    if (!customer) return null;
    Object.assign(customer, {
      blacklisted: false,
      blacklistReason: null,
      blacklistMotif: null,
      blacklistedAt: null,
      blacklistedBy: null,
      updatedAt: new Date().toISOString(),
    });
    return enrichCustomer(customer, omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}/blacklist`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

const getRiskProfile = async (id) => {
  if (env.useMock) {
    const customer = crmMock.find((c) => c.id === id);
    if (!customer) return null;
    const metrics = computeCustomerMetrics(id, omsMock);

    const score     = customer.fraudScore || 0;
    const riskLevel = computeRiskLevel(score);

    const tauxRetour     = metrics.tauxRetour || 0;
    const tauxAnnulation = metrics.tauxAnnulation || 0;
    const totalOrders    = metrics.totalOrders;

    // Distinct wilayas used in orders = address stability proxy
    const customerOrders   = omsMock.filter((o) => o.customerId === id);
    const distinctWilayas  = new Set(customerOrders.map((o) => o.wilayaCode)).size;
    const addressStability = Math.min(100, Math.round((distinctWilayas / Math.max(totalOrders, 1)) * 100));

    // Frequency score: more orders = less suspicious
    const freqScore = totalOrders >= 10 ? 10
      : totalOrders >= 5 ? 25
      : totalOrders >= 3 ? 40
      : totalOrders >= 1 ? 60
      : 80;

    const levelFor = (val) =>
      val >= 80 ? 'CRITICAL' : val >= 60 ? 'HIGH' : val >= 30 ? 'MEDIUM' : 'LOW';

    const recommendations = [];
    if (tauxRetour > 20)      recommendations.push('Taux de retour élevé — vérifier la qualité des produits livrés');
    if (tauxAnnulation > 30)  recommendations.push('Nombreuses annulations — appel de confirmation recommandé avant expédition');
    if (score > 70)           recommendations.push('Score de fraude élevé — supervision manuelle des prochaines commandes');
    if (distinctWilayas > 3)  recommendations.push('Adresses de livraison très dispersées — confirmer l\'adresse avant expédition');
    if (!recommendations.length) recommendations.push('Aucune action corrective nécessaire pour ce client');

    return {
      customerId: id,
      score,
      level: riskLevel,
      description: riskLevel === 'CRITICAL' ? 'Profil à risque critique — surveillance immédiate requise'
        : riskLevel === 'HIGH' ? 'Profil à risque élevé — validation manuelle recommandée'
        : riskLevel === 'MEDIUM' ? 'Profil à risque modéré — surveillance régulière conseillée'
        : 'Profil à faible risque — comportement normal',
      tendency: score < 30 ? 'improving' : score < 60 ? 'stable' : 'worsening',
      factors: [
        {
          name: 'Taux de Retour',
          weight: 35,
          level: levelFor(tauxRetour),
          value: tauxRetour,
          description: `${tauxRetour}% des commandes retournées (${metrics.returnedCount} sur ${totalOrders})`,
        },
        {
          name: 'Fréquence Commandes',
          weight: 25,
          level: levelFor(freqScore),
          value: freqScore,
          description: `${totalOrders} commande(s) passée(s) — historique ${totalOrders >= 5 ? 'établi' : 'limité'}`,
        },
        {
          name: 'Comportement Paiement',
          weight: 25,
          level: levelFor(tauxAnnulation),
          value: tauxAnnulation,
          description: `${tauxAnnulation}% d'annulations (${metrics.cancelledCount} sur ${totalOrders})`,
        },
        {
          name: 'Stabilité Adresse',
          weight: 15,
          level: levelFor(addressStability),
          value: addressStability,
          description: `${distinctWilayas} wilaya(s) de livraison distincte(s)`,
        },
      ],
      recommendations,
      computedAt: new Date().toISOString(),
    };
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}/risk`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return await res.json();
};

const getCRMStats = async () => {
  if (env.useMock) {
    const ticketsMock = require('../mocks/crm-tickets.mock');
    const enriched = crmMock.map((c) => enrichCustomer(c, omsMock));

    const vipCustomers      = enriched.filter((c) => c.segment === 'VIP');
    const fideleCustomers   = enriched.filter((c) => c.segment === 'Fidèle');
    const nouveauCustomers  = enriched.filter((c) => c.segment === 'Nouveau');
    const inactifCustomers  = enriched.filter((c) => c.segment === 'Inactif');
    const aRisqueCustomers  = enriched.filter((c) => c.segment === 'A risque');
    const blacklisted       = enriched.filter((c) => c.blacklisted);

    const vipAvgCA = vipCustomers.length > 0
      ? Math.round(vipCustomers.reduce((s, c) => s + c.totalSpentTTC, 0) / vipCustomers.length)
      : 0;

    const openTickets    = ticketsMock.filter((t) => ['Ouvert', 'En cours'].includes(t.status));
    const escalatedCount = ticketsMock.filter((t) => t.escalated).length;

    // Active: last order within 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeCount = enriched.filter(
      (c) => c.lastOrderDate && new Date(c.lastOrderDate) >= thirtyDaysAgo,
    ).length;

    const wilayaCount = new Set(enriched.map((c) => c.wilayaCode)).size;

    // New this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = enriched.filter(
      (c) => new Date(c.createdAt) >= startOfMonth,
    ).length;

    // Blacklisted today
    const today = new Date().toISOString().slice(0, 10);
    const blacklistedToday = blacklisted.filter(
      (c) => c.blacklistedAt && c.blacklistedAt.slice(0, 10) === today,
    ).length;

    // Conversion: Nouveau → Fidèle proxy (nouveaux who placed 2nd order = not computed, use 0 for now)
    const conversionRate = nouveauCustomers.length > 0
      ? Math.round((fideleCustomers.length / (fideleCustomers.length + nouveauCustomers.length)) * 100)
      : 0;

    return {
      totalCustomers: enriched.length,
      activeCount,
      wilayaCount,
      vipCount: vipCustomers.length,
      vipAvgCA,
      fideleCount: fideleCustomers.length,
      newThisMonth,
      conversionRate,
      nouveauCount: nouveauCustomers.length,
      inactifCount: inactifCustomers.length,
      aRisqueCount: aRisqueCustomers.length,
      blacklistedCount: blacklisted.length,
      blacklistedToday,
      openTicketsCount: openTickets.length,
      escalatedCount,
    };
  }
  throw new Error('getCRMStats not implemented for real backend');
};

const getCRMAnalytics = async (period = '30d') => {
  if (env.useMock) {
    const enriched = crmMock.map((c) => enrichCustomer(c, omsMock));

    // Segmentation donut
    const segmentCounts = {
      VIP: 0, Fidèle: 0, Nouveau: 0, Inactif: 0, 'A risque': 0, 'Liste noire': 0,
    };
    enriched.forEach((c) => { segmentCounts[c.segment] = (segmentCounts[c.segment] || 0) + 1; });

    // Wilaya delivery rates from OMS orders
    const wilayaMap = {};
    omsMock.forEach((o) => {
      if (!wilayaMap[o.wilayaCode]) wilayaMap[o.wilayaCode] = { total: 0, delivered: 0 };
      wilayaMap[o.wilayaCode].total += 1;
      if (DELIVERED_STATUSES.includes(o.status)) wilayaMap[o.wilayaCode].delivered += 1;
    });
    const wilayaDelivery = Object.entries(wilayaMap)
      .map(([code, v]) => ({
        wilayaCode: code,
        deliveryRate: Math.round((v.delivered / v.total) * 100),
        totalOrders: v.total,
      }))
      .sort((a, b) => b.deliveryRate - a.deliveryRate)
      .slice(0, 10);

    // Return rate weekly (last 4 weeks simulated from OMS)
    const returnRateWeekly = [
      { week: 'S-4', rate: 8 },
      { week: 'S-3', rate: 11 },
      { week: 'S-2', rate: 14 },
      { week: 'S-1', rate: Math.round((omsMock.filter((o) => RETURNED_STATUSES.includes(o.status)).length / omsMock.length) * 100) },
    ];

    // Top clients by CA
    const topClients = enriched
      .filter((c) => !c.blacklisted)
      .sort((a, b) => b.totalSpentTTC - a.totalSpentTTC)
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        nameFr: c.nameFr,
        wilayaCode: c.wilayaCode,
        totalSpentTTC: c.totalSpentTTC,
        totalOrders: c.totalOrders,
        segment: c.segment,
      }));

    // Insatisfaction reasons from return/failed orders
    const insatisfactionReasons = [
      { reason: 'Colis endommagé', count: omsMock.filter((o) => o.status === 'Returned').length + 1 },
      { reason: 'Produit non conforme', count: 3 },
      { reason: 'Retard de livraison', count: omsMock.filter((o) => o.status === 'DeliveryFailed_Absent').length },
      { reason: 'Client absent répété', count: omsMock.filter((o) => o.status === 'LostInTransit').length + 1 },
      { reason: 'Doublon commande', count: 2 },
    ].sort((a, b) => b.count - a.count);

    return {
      period,
      segmentation: Object.entries(segmentCounts).map(([segment, count]) => ({ segment, count })),
      wilayaDelivery,
      returnRateWeekly,
      topClients,
      insatisfactionReasons,
    };
  }
  throw new Error('getCRMAnalytics not implemented for real backend');
};

const phoneLookup = async (phone) => {
  if (env.useMock) {
    const normalized = phone.replace(/\s/g, '');
    const customer = crmMock.find(
      (c) => c.phone === normalized || (c.phoneSec && c.phoneSec === normalized),
    );
    if (!customer) return null;
    return enrichCustomer(customer, omsMock);
  }
  const res = await fetch(`${env.engineBUrl}/api/customers/lookup?phone=${encodeURIComponent(phone)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  blacklistCustomer,
  removeFromBlacklist,
  getRiskProfile,
  getCRMStats,
  getCRMAnalytics,
  phoneLookup,
};
