const env = require('../config/env');
const dashboardMock = require('../mocks/dashboard.mock');

const getDashboard = async () => {
  if (env.useMock) return dashboardMock;
  const [resA, resB] = await Promise.all([
    fetch(`${env.engineAUrl}/api/dashboard`),
    fetch(`${env.engineBUrl}/api/dashboard`),
  ]);
  if (!resA.ok || !resB.ok) throw new Error('Dashboard fetch failed');
  const [a, b] = await Promise.all([resA.json(), resB.json()]);
  return { ...a, ...b };
};

module.exports = { getDashboard };