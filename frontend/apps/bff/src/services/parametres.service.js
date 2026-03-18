const env = require('../config/env');
const parametresMock = require('../mocks/parametres.mock');

const getSettings = async () => {
  if (env.useMock) return parametresMock;
  const res = await fetch(`${env.engineAUrl}/api/settings`);
  if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);
  return res.json();
};

module.exports = { getSettings };