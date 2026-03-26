const CARRIERS = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'];

const TRANSIT_STATES = ['AwaitingPickup', 'HandedToCarrier', 'OutForDelivery'];
const DELIVERED_STATES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const FAIL_STATES = ['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'];

const CARRIER_THEME = {
  Yalidine: { apiVersion: 'v1.3' },
  Maystro: { apiVersion: 'v1.1' },
  Ecotrack: { apiVersion: 'v2.0' },
  Procolis: { apiVersion: null },
};

function computeCarrierSuivi(orders) {
  const carriers = {};

  CARRIERS.forEach((name) => {
    const carrierOrders = orders.filter((o) => o.carrier === name);
    const transit = carrierOrders.filter((o) => TRANSIT_STATES.includes(o.status));
    const delivered = carrierOrders.filter((o) => DELIVERED_STATES.includes(o.status));
    const failed = carrierOrders.filter((o) => FAIL_STATES.includes(o.status));
    const total = delivered.length + failed.length;

    const deliveredDurations = delivered
      .map((o) => {
        const created = new Date(o.createdAt).getTime();
        const updated = new Date(o.updatedAt).getTime();
        return Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
      })
      .filter((v) => Number.isFinite(v));
    const delaiMoyen =
      deliveredDurations.length > 0
        ? Math.round(
          deliveredDurations.reduce((s, v) => s + v, 0) / deliveredDurations.length,
        )
        : null;

    const wilayas = new Set(carrierOrders.map((o) => o.wilayaCode)).size;

    carriers[name] = {
      connected: name !== 'Procolis',
      apiVersion: CARRIER_THEME[name].apiVersion,
      enTransit: transit.length,
      livres: delivered.length,
      echecs: failed.length,
      tauxLivraison: total > 0 ? delivered.length / total : null,
      delaiMoyen: name !== 'Procolis' ? delaiMoyen : null,
      wilayas: name !== 'Procolis' ? wilayas : null,
      recentShipments: carrierOrders
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4)
        .map((o) => ({
          trk: o.trackingNumber ?? o.tracking?.trackingNumber ?? `TRK-${name.slice(0, 3).toUpperCase()}-${o.id.slice(-4)}`,
          orderRef: `#${o.reference}`,
          wilaya: o.wilayaCode,
          status: o.status,
        })),
      note:
        name === 'Procolis'
          ? 'Integration API non connectee - suivi partiel.'
          : undefined,
    };
  });

  return {
    totalActiveCarriers: Object.values(carriers).filter((c) => c.connected).length,
    totalShipments: orders.filter((o) => o.carrier).length,
    carriers,
  };
}

module.exports = { computeCarrierSuivi };
