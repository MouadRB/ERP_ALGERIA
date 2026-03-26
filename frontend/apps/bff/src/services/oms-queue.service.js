function computePriority(order) {
  const msRemaining = order.autoCancelAt
    ? new Date(order.autoCancelAt).getTime() - Date.now()
    : Infinity;
  const urgentExpiry = msRemaining < 30 * 60 * 1000;

  if (order.riskLevel === 'HIGH' && urgentExpiry) return 1;
  if (order.riskLevel === 'HIGH') return 2;
  if (order.riskLevel === 'MEDIUM') return 3;
  return 4;
}

function computeQueue(orders) {
  return orders
    .filter((o) => o.status === 'AwaitingValidation')
    .map((o) => ({ ...o, priority: computePriority(o) }))
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const aTime = a.autoCancelAt ? new Date(a.autoCancelAt).getTime() : Infinity;
      const bTime = b.autoCancelAt ? new Date(b.autoCancelAt).getTime() : Infinity;
      return aTime - bTime;
    });
}

module.exports = { computeQueue, computePriority };
