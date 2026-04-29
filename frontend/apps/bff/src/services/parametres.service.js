const env = require('../config/env');
const parametresMock = require('../mocks/parametres.mock');

let settingsStore = JSON.parse(JSON.stringify(parametresMock));

const getSettings = async () => {
  if (env.useMock) return settingsStore;
  const res = await fetch(`${env.engineAUrl}/api/settings`);
  if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);
  return res.json();
};

const updateSettings = async (payload) => {
  if (env.useMock) {
    settingsStore = {
      ...settingsStore,
      ...payload,
      informationsSociete: {
        ...settingsStore.informationsSociete,
        ...payload?.informationsSociete,
      },
      regionalLangue: {
        ...settingsStore.regionalLangue,
        ...payload?.regionalLangue,
      },
      notifications: {
        ...settingsStore.notifications,
        ...payload?.notifications,
      },
      gestionCommandes: {
        ...settingsStore.gestionCommandes,
        ...payload?.gestionCommandes,
      },
      livraisonWilayas: {
        ...settingsStore.livraisonWilayas,
        ...payload?.livraisonWilayas,
      },
      inventaireStock: {
        ...settingsStore.inventaireStock,
        ...payload?.inventaireStock,
      },
      crmClients: {
        ...settingsStore.crmClients,
        ...payload?.crmClients,
      },
      utilisateursRoles: {
        ...settingsStore.utilisateursRoles,
        ...payload?.utilisateursRoles,
      },
      securiteAcces: {
        ...settingsStore.securiteAcces,
        ...payload?.securiteAcces,
      },
    };

    return settingsStore;
  }

  const res = await fetch(`${env.engineAUrl}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Settings update failed: ${res.status}`);
  return res.json();
};

module.exports = { getSettings, updateSettings };
