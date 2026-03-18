const env = require('../config/env');
const notificationsMock = require('../mocks/notifications.mock');

const getNotifications = async (userId) => {
  if (env.useMock) return { data: notificationsMock, meta: { total: notificationsMock.length } };
  const res = await fetch(`${env.engineAUrl}/api/notifications?userId=${userId}`);
  if (!res.ok) throw new Error(`Notifications fetch failed: ${res.status}`);
  return res.json();
};

module.exports = { getNotifications };