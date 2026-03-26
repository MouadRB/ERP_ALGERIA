const CARRIERS = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'];
const CARRIER_COLORS = {
  Yalidine: '#0D47A1',
  Maystro: '#E65100',
  Ecotrack: '#1B5E20',
  Procolis: '#4A148C',
};

const DELIVERED_STATES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const CONFIRMED_STATES = ['Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery', ...DELIVERED_STATES];
const FAIL_STATES = ['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'];

const WILAYA_LABELS = {
  '16': 'Alger',
  '31': 'Oran',
  '25': 'Constantine',
  '19': 'Setif',
  '23': 'Annaba',
  '06': 'Bejaia',
  '09': 'Blida',
  '05': 'Batna',
  '13': 'Tlemcen',
  '15': 'Tizi Ouzou',
  '35': 'Boumerdes',
  '08': 'Bechar',
  '29': 'Mascara',
  '41': 'Souk Ahras',
  '43': 'Mila',
  '02': 'Chlef',
  '18': 'Jijel',
  '28': "M'sila",
  '07': 'Biskra',
  '10': 'Bouira',
};

const PERIOD_DAYS = { today: 1, '7d': 7, '30d': 30, '90d': 90 };

function formatDayLabel(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function computeVolumeByDay(orders, period) {
  const days = PERIOD_DAYS[period] ?? 7;
  const now = new Date();
  const buckets = [];
  const byKey = new Map();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = { date: formatDayLabel(d), total: 0, confirmees: 0, livrees: 0, key };
    buckets.push(entry);
    byKey.set(key, entry);
  }

  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const bucket = byKey.get(key);
    if (!bucket) return;
    bucket.total += 1;
    if (CONFIRMED_STATES.includes(o.status)) bucket.confirmees += 1;
    if (DELIVERED_STATES.includes(o.status)) bucket.livrees += 1;
  });

  const data = buckets.map(({ key, ...rest }) => rest);

  const maxEntry = data.reduce(
    (a, b) => (b.total > a.total ? b : a),
    data[0] ?? { date: '-', total: 0 },
  );
  const minEntry = data.reduce(
    (a, b) => (b.total < a.total ? b : a),
    data[0] ?? { date: '-', total: 0 },
  );

  const half = Math.max(1, Math.floor(data.length / 2));
  const firstAvg = data.slice(0, half).reduce((s, d) => s + d.total, 0) / half;
  const secondAvg =
    data.slice(half).reduce((s, d) => s + d.total, 0) / Math.max(data.length - half, 1);
  const croissance = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

  return {
    data,
    maxDay: { date: maxEntry.date, total: maxEntry.total },
    minDay: { date: minEntry.date, total: minEntry.total, label: '' },
    croissance,
  };
}

function computeByOperator(orders) {
  const map = new Map();
  orders.forEach((o) => {
    if (!o.confirmedBy) return;
    if (!map.has(o.confirmedBy)) {
      map.set(o.confirmedBy, { name: o.confirmedBy, appelees: 0, confirmees: 0 });
    }
    const row = map.get(o.confirmedBy);
    row.appelees += 1;
    if (CONFIRMED_STATES.includes(o.status)) row.confirmees += 1;
  });

  const data = Array.from(map.values()).map((row) => ({
    ...row,
    tauxConfirmation: row.appelees > 0 ? row.confirmees / row.appelees : 0,
  }));

  const teamAvgTauxConfirmation =
    data.length > 0
      ? data.reduce((s, r) => s + r.tauxConfirmation, 0) / data.length
      : 0;

  return { teamAvgTauxConfirmation, data };
}

function computeByCarrier(orders) {
  const ordersWithCarrier = orders.filter((o) => o.carrier);
  const donut = CARRIERS.map((name) => ({
    name,
    value: ordersWithCarrier.filter((o) => o.carrier === name).length,
    color: CARRIER_COLORS[name],
  })).filter((d) => d.value > 0);

  const tauxLivraison = CARRIERS.map((name) => {
    const delivered = orders.filter((o) => o.carrier === name && DELIVERED_STATES.includes(o.status)).length;
    const failed = orders.filter((o) => o.carrier === name && FAIL_STATES.includes(o.status)).length;
    const total = delivered + failed;
    return {
      name,
      taux: total > 0 ? Math.round((delivered / total) * 100) : 0,
      color: CARRIER_COLORS[name],
    };
  });

  const totalEnvoisActifs = ordersWithCarrier.filter((o) => ['HandedToCarrier', 'OutForDelivery'].includes(o.status)).length;

  return {
    totalEnvoisActifs,
    donut,
    tauxLivraison,
  };
}

function computeByWilaya(orders) {
  const map = new Map();
  orders.forEach((o) => {
    if (!o.wilayaCode) return;
    map.set(o.wilayaCode, (map.get(o.wilayaCode) ?? 0) + 1);
  });

  const data = Array.from(map.entries())
    .map(([code, count]) => ({
      code,
      name: WILAYA_LABELS[code] ?? code,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalWilayasActives: map.size,
    data,
  };
}

function computeAnnulationReasons(orders) {
  const cancelled = orders.filter((o) => o.status === 'Cancelled');
  const map = new Map();
  cancelled.forEach((o) => {
    const reason = o.cancelReason || 'Autre';
    map.set(reason, (map.get(reason) ?? 0) + 1);
  });

  const palette = ['#C62828', '#FF8A00', '#F9A825', '#0D47A1', '#4A148C', '#2E7D32'];
  const data = Array.from(map.entries()).map(([raison, count], idx) => ({
    raison,
    count,
    color: palette[idx % palette.length],
  }));

  const autoExpire = cancelled.filter(
    (o) => o.cancelReason && o.cancelReason.toLowerCase().includes('expire'),
  ).length;

  return {
    totalAnnulations: cancelled.length,
    autoExpire,
    data,
  };
}

function computeAnalytics(orders, period = '7d') {
  const days = PERIOD_DAYS[period] ?? 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const filtered = orders.filter((o) => new Date(o.createdAt) >= cutoff);

  return {
    period,
    volume: computeVolumeByDay(filtered, period),
    operateurs: computeByOperator(filtered),
    carrierRepartition: computeByCarrier(filtered),
    wilayas: computeByWilaya(filtered),
    annulations: computeAnnulationReasons(filtered),
  };
}

module.exports = { computeAnalytics };
