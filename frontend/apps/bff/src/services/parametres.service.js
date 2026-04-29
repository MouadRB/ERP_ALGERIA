const parametresMock = require('../mocks/parametres.mock');

// Parametres are ERP application-level settings managed by the BFF in-memory store.
// Engine A (OMS/PIM/catalogue) does not own these settings.
let settingsStore = JSON.parse(JSON.stringify(parametresMock));

const getSettings = async () => settingsStore;

const updateSettings = async (payload) => {
  settingsStore = {
    ...settingsStore,
    ...payload,
    informationsSociete: { ...settingsStore.informationsSociete, ...payload?.informationsSociete },
    regionalLangue: { ...settingsStore.regionalLangue, ...payload?.regionalLangue },
    notifications: { ...settingsStore.notifications, ...payload?.notifications },
    gestionCommandes: { ...settingsStore.gestionCommandes, ...payload?.gestionCommandes },
    livraisonWilayas: { ...settingsStore.livraisonWilayas, ...payload?.livraisonWilayas },
    inventaireStock: { ...settingsStore.inventaireStock, ...payload?.inventaireStock },
    crmClients: { ...settingsStore.crmClients, ...payload?.crmClients },
    utilisateursRoles: { ...settingsStore.utilisateursRoles, ...payload?.utilisateursRoles },
    securiteAcces: { ...settingsStore.securiteAcces, ...payload?.securiteAcces },
  };
  return settingsStore;
};

module.exports = { getSettings, updateSettings };
