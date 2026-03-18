/**
 * Maps Engine A order response to BFF Order contract.
 * Used when USE_MOCK=false.
 */
const transformOrder = (raw) => ({
  id: raw.orderId ?? raw.id,
  reference: raw.reference,
  customerPhone: raw.customer?.phone,
  customerNameFr: raw.customer?.fullNameFr ?? raw.customer?.fullName,
  customerNameAr: raw.customer?.fullNameAr ?? '',
  wilayaCode: raw.deliveryAddress?.wilayaCode ?? raw.wilayaCode,
  address: raw.deliveryAddress?.street ?? raw.address,
  items: (raw.lines ?? raw.items ?? []).map((line) => ({
    productId: line.productId,
    sku: line.sku,
    nameFr: line.nameFr ?? line.name,
    nameAr: line.nameAr ?? '',
    quantity: line.qty ?? line.quantity,
    unitPriceHT: line.unitPriceHT,
    unitPriceTTC: line.unitPriceTTC,
    tvaRate: line.tvaRate ?? 'standard',
  })),
  totalHT: raw.amountHT ?? raw.totalHT,
  totalTVA: raw.amountTVA ?? raw.totalTVA,
  totalTTC: raw.amountTTC ?? raw.totalTTC,
  codAmount: raw.codAmount ?? raw.amountTTC,
  status: raw.state ?? raw.status,
  carrier: raw.carrier ?? null,
  deliveryAttempts: raw.deliveryAttempts ?? 0,
  autoCancelAt: raw.autoCancelAt ?? null,
  riskLevel: raw.riskLevel ?? 'LOW',
  fraudScore: raw.fraudScore ?? null,
  createdBy: raw.createdBy,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  revenueRecognizedAt: raw.revenueRecognizedAt ?? null,
});

const transformOrderList = (rawList) => rawList.map(transformOrder);

module.exports = { transformOrder, transformOrderList };