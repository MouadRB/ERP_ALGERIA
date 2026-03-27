const OPERATORS = require('./oms-operators.mock');
const CRM_CUSTOMERS = require('./crm.mock');

// Maps each order index (0–52) to a customerId.
// Distribution is intentional: CUST-001 gets good-status orders → VIP segment;
// CUST-008/013/015 get bad-status orders → À risque / Liste noire.
const ORDER_CUSTOMER_MAP = [
  /* 0-8  AwaitingValidation */ 'CUST-013','CUST-002','CUST-003','CUST-004','CUST-005','CUST-006','CUST-007','CUST-008','CUST-014',
  /* 9-15 Confirmed          */ 'CUST-001','CUST-001','CUST-002','CUST-003','CUST-004','CUST-015','CUST-005',
  /* 16-19 AwaitingPickup    */ 'CUST-006','CUST-007','CUST-008','CUST-009',
  /* 20-24 HandedToCarrier   */ 'CUST-010','CUST-011','CUST-012','CUST-013','CUST-009',
  /* 25-29 OutForDelivery    */ 'CUST-001','CUST-002','CUST-003','CUST-004','CUST-005',
  /* 30-35 DeliveredCOD_Conf */ 'CUST-001','CUST-001','CUST-001','CUST-006','CUST-007','CUST-002',
  /* 36-37 COD_Remitted      */ 'CUST-001','CUST-001',
  /* 38-40 DeliveryFailed    */ 'CUST-008','CUST-004','CUST-010',
  /* 41-42 ReturnInTransit   */ 'CUST-012','CUST-014',
  /* 43    LostInTransit     */ 'CUST-011',
  /* 44-45 Returned          */ 'CUST-003','CUST-005',
  /* 46-50 Cancelled         */ 'CUST-006','CUST-007','CUST-009','CUST-010','CUST-011',
  /* 51-52 Draft             */ 'CUST-002','CUST-015',
];

const BASE_DATE = new Date('2026-03-25T12:00:00Z');
const CARRIERS = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'];
const SOURCE_CHANNELS = ['Saisie manuelle', 'Instagram', 'Facebook', 'WhatsApp', 'Appel telephonique'];
const CANCEL_REASONS = ['Expire (timer)', 'Client refuse', 'Adresse incorrecte', 'Doublon commande', 'Stock absent'];

const WILAYAS = [
  { code: '16', name: 'Alger', commune: 'Alger Centre', address: '12 Rue Didouche Mourad' },
  { code: '31', name: 'Oran', commune: 'Oran Centre', address: '7 Boulevard Millenium' },
  { code: '25', name: 'Constantine', commune: 'Constantine Centre', address: '3 Rue Larbi Ben Mhidi' },
  { code: '19', name: 'Setif', commune: 'Setif Centre', address: '18 Avenue du 8 Mai 1945' },
  { code: '23', name: 'Annaba', commune: 'Annaba Centre', address: '2 Rue Boukhadra' },
  { code: '06', name: 'Bejaia', commune: 'Bejaia Centre', address: '10 Rue des Freres Bouadou' },
  { code: '09', name: 'Blida', commune: 'Blida Centre', address: '55 Cite El Moudjahid' },
  { code: '05', name: 'Batna', commune: 'Batna Centre', address: '3 Rue Ibn Khaldoun' },
  { code: '13', name: 'Tlemcen', commune: 'Tlemcen Centre', address: '4 Rue Emir Abdelkader' },
  { code: '15', name: 'Tizi Ouzou', commune: 'Tizi Ouzou Centre', address: '5 Boulevard Zighoud Youcef' },
  { code: '35', name: 'Boumerdes', commune: 'Boumerdes Centre', address: "17 Boulevard de l'ALN" },
  { code: '08', name: 'Bechar', commune: 'Bechar Centre', address: '21 Rue du 1er Novembre' },
  { code: '29', name: 'Mascara', commune: 'Mascara Centre', address: '4 Rue Larbi Ben Mhidi' },
  { code: '41', name: 'Souk Ahras', commune: 'Souk Ahras Centre', address: '9 Cite El Houria' },
  { code: '43', name: 'Mila', commune: 'Mila Centre', address: '30 Rue Emir Abdelkader' },
  { code: '02', name: 'Chlef', commune: 'Chlef Centre', address: '14 Cite Bab El Oued' },
  { code: '18', name: 'Jijel', commune: 'Jijel Centre', address: '6 Cite OPGI' },
  { code: '28', name: "M'sila", commune: "M'sila Centre", address: '11 Rue des Martyrs' },
  { code: '07', name: 'Biskra', commune: 'Biskra Centre', address: '1 Rue des Palmiers' },
  { code: '10', name: 'Bouira', commune: 'Bouira Centre', address: '22 Rue du 5 Juillet' },
];

const NAMES = [
  { fr: 'Mohamed Ben Ali', ar: 'Mohamed Ben Ali' },
  { fr: 'Fatima Bouzid', ar: 'Fatima Bouzid' },
  { fr: 'Karim Meziane', ar: 'Karim Meziane' },
  { fr: 'Nadia Hamidi', ar: 'Nadia Hamidi' },
  { fr: 'Youcef Belkassem', ar: 'Youcef Belkassem' },
  { fr: 'Amina Khelifi', ar: 'Amina Khelifi' },
  { fr: 'Rachid Boumediene', ar: 'Rachid Boumediene' },
  { fr: 'Samira Hadj Ahmed', ar: 'Samira Hadj Ahmed' },
  { fr: 'Abdelkader Ferhat', ar: 'Abdelkader Ferhat' },
  { fr: 'Louisa Mansouri', ar: 'Louisa Mansouri' },
  { fr: 'Mourad Zeroual', ar: 'Mourad Zeroual' },
  { fr: 'Djamila Bensalem', ar: 'Djamila Bensalem' },
  { fr: 'Hamza Tounsi', ar: 'Hamza Tounsi' },
  { fr: 'Tarek Belmahi', ar: 'Tarek Belmahi' },
  { fr: 'Naima Boukhari', ar: 'Naima Boukhari' },
  { fr: 'Walid Djellouli', ar: 'Walid Djellouli' },
  { fr: 'Chafia Larbi', ar: 'Chafia Larbi' },
  { fr: 'Salim Ouahrani', ar: 'Salim Ouahrani' },
  { fr: 'Houria Ziani', ar: 'Houria Ziani' },
  { fr: 'Abdelaziz Kerroum', ar: 'Abdelaziz Kerroum' },
];

const ITEM_CATALOG = [
  { sku: 'SKU-ELEC-001', nameFr: 'Samsung Galaxy A54', nameAr: 'Samsung Galaxy A54', priceTTC: 50000 },
  { sku: 'SKU-MODE-011', nameFr: 'Robe Caftan Brodee', nameAr: 'Robe Caftan', priceTTC: 9000 },
  { sku: 'SKU-ELEC-020', nameFr: 'Aspirateur Rowenta', nameAr: 'Aspirateur Rowenta', priceTTC: 30000 },
  { sku: 'SKU-ELEC-033', nameFr: 'Tablette Huawei T10', nameAr: 'Tablette Huawei T10', priceTTC: 35000 },
  { sku: 'SKU-ELEC-044', nameFr: 'Machine a cafe DeLonghi', nameAr: 'Machine a cafe', priceTTC: 20000 },
  { sku: 'SKU-ELEC-055', nameFr: 'Smart TV Samsung 55', nameAr: 'Smart TV Samsung', priceTTC: 90000 },
  { sku: 'SKU-MODE-022', nameFr: 'Ensemble Hijab Soie', nameAr: 'Ensemble Hijab', priceTTC: 3000 },
  { sku: 'SKU-ELEC-070', nameFr: 'Console PlayStation 5', nameAr: 'Console PS5', priceTTC: 100000 },
  { sku: 'SKU-COSM-005', nameFr: 'Coffret parfum', nameAr: 'Coffret parfum', priceTTC: 15000 },
  { sku: 'SKU-ELEC-081', nameFr: 'Laptop Lenovo IdeaPad', nameAr: 'Laptop Lenovo', priceTTC: 80000 },
  { sku: 'SKU-HOME-010', nameFr: 'Robot menager Moulinex', nameAr: 'Robot menager', priceTTC: 12000 },
  { sku: 'SKU-ELEC-090', nameFr: 'iPhone 15 Pro Max', nameAr: 'iPhone 15 Pro Max', priceTTC: 200000 },
  { sku: 'SKU-HOME-020', nameFr: 'Climatiseur Condor 12000', nameAr: 'Climatiseur Condor', priceTTC: 60000 },
  { sku: 'SKU-ELEC-110', nameFr: 'Imprimante HP LaserJet', nameAr: 'Imprimante HP', priceTTC: 35000 },
  { sku: 'SKU-COSM-010', nameFr: 'Coffret soin visage', nameAr: 'Coffret soin visage', priceTTC: 6000 },
  { sku: 'SKU-MODE-030', nameFr: 'Djellaba brodee', nameAr: 'Djellaba', priceTTC: 12000 },
  { sku: 'SKU-HOME-030', nameFr: 'Fer a repasser Philips', nameAr: 'Fer a repasser', priceTTC: 7000 },
  { sku: 'SKU-ELEC-120', nameFr: 'Chargeur rapide USB-C', nameAr: 'Chargeur USB-C', priceTTC: 2500 },
];

const STATUS_PLAN = [
  { status: 'AwaitingValidation', count: 9 },
  { status: 'Confirmed', count: 7 },
  { status: 'AwaitingPickup', count: 4 },
  { status: 'HandedToCarrier', count: 5 },
  { status: 'OutForDelivery', count: 5 },
  { status: 'DeliveredCOD_Confirmed', count: 6 },
  { status: 'COD_Remitted', count: 2 },
  { status: 'DeliveryFailed_Absent', count: 3 },
  { status: 'ReturnInTransit_Refused', count: 2 },
  { status: 'LostInTransit', count: 1 },
  { status: 'Returned', count: 2 },
  { status: 'Cancelled', count: 5 },
  { status: 'Draft', count: 2 },
];

const pad = (n, len = 5) => String(n).padStart(len, '0');
const addHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);
const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

function makePhone(idx) {
  const prefix = ['05', '06', '07', '07'][idx % 4];
  const rest = String(10000000 + (idx * 137) % 90000000);
  return `${prefix}${rest}`;
}

function pick(list, idx) {
  return list[idx % list.length];
}

function makeItems(seed) {
  const count = 1 + (seed % 3);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const item = pick(ITEM_CATALOG, seed + i);
    const qty = 1 + ((seed + i) % 3);
    const total = item.priceTTC * qty;
    items.push({
      productId: item.sku.replace('SKU', 'PRD'),
      sku: item.sku,
      nameFr: item.nameFr,
      nameAr: item.nameAr,
      quantity: qty,
      qty,
      unitPriceHT: Math.round(item.priceTTC / 1.19),
      unitPriceTTC: item.priceTTC,
      prixUnitTTC: item.priceTTC,
      tvaRate: 'standard',
      total,
    });
  }
  return items;
}

function computeTotals(items) {
  const totalTTC = items.reduce((s, it) => s + it.total, 0);
  const totalHT = Math.round(totalTTC / 1.19);
  const totalTVA = totalTTC - totalHT;
  return { totalTTC, totalHT, totalTVA };
}

function statusNeedsCarrier(status) {
  return [
    'AwaitingPickup',
    'HandedToCarrier',
    'OutForDelivery',
    'DeliveredCOD_Confirmed',
    'COD_Remitted',
    'DeliveryFailed_Absent',
    'ReturnInTransit_Refused',
    'LostInTransit',
    'Returned',
  ].includes(status);
}

function statusLabel(status, carrier) {
  switch (status) {
    case 'HandedToCarrier':
      return `Pris en charge par ${carrier}`;
    case 'OutForDelivery':
      return 'En cours de livraison';
    case 'DeliveredCOD_Confirmed':
      return 'Livre - COD encaisse';
    case 'COD_Remitted':
      return 'COD remis';
    case 'DeliveryFailed_Absent':
      return 'Client absent';
    case 'ReturnInTransit_Refused':
      return 'Retour en transit';
    case 'LostInTransit':
      return 'Perdu en transit';
    case 'Returned':
      return 'Retourne au depot';
    case 'AwaitingPickup':
      return 'En attente de ramassage';
    default:
      return status;
  }
}

function buildTracking(status, carrier, trackingNumber, createdAt, attemptCount) {
  if (!carrier) {
    return { carrier: null, trackingNumber: null, events: [], attempts: [] };
  }

  const events = [];
  const firstAt = addHours(createdAt, 6);
  events.push({
    date: firstAt.toISOString(),
    status: 'HandedToCarrier',
    label: statusLabel('HandedToCarrier', carrier),
  });

  if (status !== 'HandedToCarrier') {
    events.push({
      date: addHours(firstAt, 16).toISOString(),
      status,
      label: statusLabel(status, carrier),
    });
  }

  const attempts = [];
  if (attemptCount > 0) {
    for (let i = 1; i <= attemptCount; i += 1) {
      attempts.push({
        attemptNumber: i,
        date: addHours(firstAt, 20 + i * 10).toISOString(),
        result: i < attemptCount ? 'Absent' : 'En cours',
        note: i === attemptCount ? 'Derniere tentative' : 'Client absent',
      });
    }
  }

  return {
    carrier,
    trackingNumber,
    events,
    attempts,
  };
}

function buildHistory(status, createdAt, updatedAt, confirmedBy, cancelReason) {
  const history = [
    {
      at: createdAt.toISOString(),
      from: 'Draft',
      to: 'AwaitingValidation',
      by: 'Systeme',
      role: 'system',
      reason: null,
    },
  ];

  if (status !== 'Draft' && status !== 'AwaitingValidation') {
    history.push({
      at: addHours(createdAt, 2).toISOString(),
      from: 'AwaitingValidation',
      to: 'Confirmed',
      by: confirmedBy || 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: null,
    });
  }

  if (status === 'Cancelled') {
    history.push({
      at: updatedAt.toISOString(),
      from: 'AwaitingValidation',
      to: 'Cancelled',
      by: confirmedBy || 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: cancelReason,
    });
    return history;
  }

  if (!['Draft', 'AwaitingValidation', 'Confirmed'].includes(status)) {
    history.push({
      at: updatedAt.toISOString(),
      from: 'Confirmed',
      to: status,
      by: 'Systeme',
      role: 'system',
      reason: null,
    });
  }

  return history;
}

function paymentStatusFrom(orderStatus) {
  if (['DeliveredCOD_Confirmed', 'COD_Remitted'].includes(orderStatus)) {
    return 'Livre - revenu reconnu';
  }
  if (['HandedToCarrier', 'OutForDelivery', 'AwaitingPickup'].includes(orderStatus)) {
    return 'En attente de livraison';
  }
  if (orderStatus === 'AwaitingValidation') return 'En attente de confirmation';
  if (orderStatus === 'Cancelled') return 'Annule';
  if (['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'].includes(orderStatus)) {
    return 'Retour en cours';
  }
  return 'En preparation';
}

function buildOrder(idx, status) {
  const seq = pad(idx + 1);
  const id = `ord-2025-${seq}`;
  const reference = `ORD-2025-${seq}`;
  const createdAt = addDays(BASE_DATE, -((idx * 2) % 30));
  const updatedAt = addHours(createdAt, 4 + (idx % 48));

  const riskLevel =
    status === 'AwaitingValidation'
      ? idx % 2 === 0
        ? 'HIGH'
        : 'MEDIUM'
      : ['LOW', 'MEDIUM', 'HIGH'][idx % 3];
  const fraudScore = riskLevel === 'HIGH' ? 0.78 : riskLevel === 'MEDIUM' ? 0.42 : 0.08;

  const customerId = ORDER_CUSTOMER_MAP[idx] || `CUST-${String((idx % 15) + 1).padStart(3, '0')}`;
  const crmCust = CRM_CUSTOMERS.find((c) => c.id === customerId) || CRM_CUSTOMERS[0];
  const customerName = { fr: crmCust.nameFr, ar: crmCust.nameAr };
  const wilaya = pick(WILAYAS, idx);
  const phone = crmCust.phone;

  const items = makeItems(idx);
  const totals = computeTotals(items);

  const carrier = statusNeedsCarrier(status) ? pick(CARRIERS, idx) : null;
  const trackingNumber = carrier ? `TRK-${carrier.slice(0, 3).toUpperCase()}-${10000 + idx}` : null;

  const attemptCount =
    status === 'DeliveryFailed_Absent'
      ? 2 + (idx % 2)
      : status === 'ReturnInTransit_Refused'
      ? 2
      : status === 'LostInTransit'
      ? 3
      : status === 'Returned'
      ? 3
      : status === 'OutForDelivery'
      ? 1
      : 0;

  const confirmedBy =
    ['Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery', 'DeliveredCOD_Confirmed', 'COD_Remitted', 'DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned']
      .includes(status)
      ? pick(OPERATORS, idx).name
      : null;

  const cancelReason = status === 'Cancelled' ? pick(CANCEL_REASONS, idx) : null;

  const autoCancelAt =
    status === 'AwaitingValidation'
      ? new Date(Date.now() + (5 + (idx % 120)) * 60 * 1000).toISOString()
      : null;

  const tracking = buildTracking(status, carrier, trackingNumber, createdAt, attemptCount);

  const paiement = {
    totalHT: totals.totalHT,
    totalTVA: totals.totalTVA,
    totalTTC: totals.totalTTC,
    codAmount: totals.totalTTC,
    paymentStatus: paymentStatusFrom(status),
    revenueRecognizedAt:
      ['DeliveredCOD_Confirmed', 'COD_Remitted'].includes(status)
        ? updatedAt.toISOString()
        : null,
    carrierRemittance:
      status === 'COD_Remitted'
        ? { status: 'Remis', expectedDate: addDays(updatedAt, 3).toISOString().slice(0, 10) }
        : status === 'DeliveredCOD_Confirmed'
        ? { status: 'En attente', expectedDate: addDays(updatedAt, 7).toISOString().slice(0, 10) }
        : null,
  };

  const customer = {
    nameFr: customerName.fr,
    nameAr: customerName.ar,
    phone,
    wilaya: wilaya.name,
    wilayaCode: wilaya.code,
    address: wilaya.address,
    orderCount: 1 + (idx % 7),
    fraudScore,
    riskLevel,
    riskSignals:
      riskLevel === 'HIGH'
        ? ['Premiere commande', 'Adresse incomplete', 'Wilaya taux retour eleve']
        : riskLevel === 'MEDIUM'
        ? ['Absence 1 tentative']
        : [],
    blacklisted: riskLevel === 'HIGH' && idx % 9 === 0,
    lastDelivery: idx % 3 === 0 ? addDays(BASE_DATE, -(5 + (idx % 20))).toISOString() : null,
  };

  return {
    id,
    reference,
    customerId,
    status,
    customerPhone: phone,
    customerNameFr: customerName.fr,
    customerNameAr: customerName.ar,
    wilayaCode: wilaya.code,
    address: wilaya.address,
    commune: wilaya.commune,
    source: pick(SOURCE_CHANNELS, idx),
    noteInterne: idx % 6 === 0 ? 'Client regulier - suivre livraison' : null,

    items,
    totalHT: totals.totalHT,
    totalTVA: totals.totalTVA,
    totalTTC: totals.totalTTC,
    codAmount: totals.totalTTC,
    revenueRecognizedAt: paiement.revenueRecognizedAt,

    carrier,
    trackingNumber,
    deliveryAttempts: attemptCount,
    autoCancelAt,

    riskLevel,
    fraudScore,
    riskSignals: customer.riskSignals,

    confirmedBy,
    cancelReason,

    history: buildHistory(status, createdAt, updatedAt, confirmedBy, cancelReason),
    tracking,
    paiement,
    customer,

    createdBy: pick(OPERATORS, idx).id,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

const orders = [];
let idx = 0;
STATUS_PLAN.forEach((plan) => {
  for (let i = 0; i < plan.count; i += 1) {
    orders.push(buildOrder(idx, plan.status));
    idx += 1;
  }
});

module.exports = orders;
