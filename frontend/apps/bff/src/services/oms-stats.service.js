const DELIVERY_STATES = ['HandedToCarrier', 'OutForDelivery'];
const DELIVERED_STATES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const FAIL_STATES = ['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'];

function computeStats(orders) {
  const byStatus = (s) => orders.filter((o) => o.status === s).length;
  const byStatuses = (ss) => orders.filter((o) => ss.includes(o.status)).length;

  const confirmer = byStatus('AwaitingValidation');
  const confirmes = byStatus('Confirmed') + byStatus('AwaitingPickup');
  const enLivraison = byStatuses(DELIVERY_STATES);
  const livres = byStatuses(DELIVERED_STATES);
  const echecs = byStatuses(FAIL_STATES);
  const annules = byStatus('Cancelled');

  const expirentBientot = orders.filter((o) => {
    if (o.status !== 'AwaitingValidation' || !o.autoCancelAt) return false;
    const remaining = new Date(o.autoCancelAt).getTime() - Date.now();
    return remaining > 0 && remaining < 30 * 60 * 1000;
  }).length;

  const caLivres = orders
    .filter((o) => o.status === 'DeliveredCOD_Confirmed')
    .reduce((s, o) => s + (o.codAmount ?? o.totalTTC ?? 0), 0);

  const carriersEnLivraison = { Yalidine: 0, Maystro: 0, autres: 0 };
  orders
    .filter((o) => DELIVERY_STATES.includes(o.status))
    .forEach((o) => {
      if (o.carrier === 'Yalidine') carriersEnLivraison.Yalidine += 1;
      else if (o.carrier === 'Maystro') carriersEnLivraison.Maystro += 1;
      else carriersEnLivraison.autres += 1;
    });

  const retoursStock = orders.filter((o) => o.status === 'Returned').length;
  const quarantaine = retoursStock;

  const annulesAuto = orders.filter(
    (o) => o.status === 'Cancelled' && o.cancelReason && o.cancelReason.toLowerCase().includes('expire'),
  ).length;
  const annulesManuel = annules - annulesAuto;

  const recues = orders.length;
  const funnel = {
    recues,
    confirmees: confirmes + enLivraison + livres,
    expediees: enLivraison + livres,
    livrees: livres,
    echecs,
  };

  const tauxConfirmation = recues > 0 ? (confirmes + enLivraison + livres) / recues : 0;
  const tauxLivraison = livres + echecs > 0 ? livres / (livres + echecs) : 0;
  const tauxEchec = recues > 0 ? echecs / recues : 0;
  const tauxAnnulation = recues > 0 ? annules / recues : 0;

  return {
    confirmer,
    confirmes,
    enLivraison,
    livres,
    echecs,
    annules,

    expirentBientot,
    caLivres,
    carriersEnLivraison,
    retoursStock,
    quarantaine,
    annulesAuto,
    annulesManuel,

    funnel,
    tauxConfirmation,
    tauxLivraison,
    tauxEchec,
    tauxAnnulation,
    lastUpdatedAt: new Date().toISOString(),
  };
}

module.exports = { computeStats };
