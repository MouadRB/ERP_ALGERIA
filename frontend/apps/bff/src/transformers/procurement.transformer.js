const transformBC = (raw) => ({
  id: raw.bcId ?? raw.id,
  reference: raw.reference,
  supplierId: raw.supplierId,
  supplierName: raw.supplierName ?? raw.supplier?.name,
  wilayaCode: raw.wilayaCode ?? raw.supplier?.wilayaCode,
  items: (raw.lines ?? raw.items ?? []).map((line) => ({
    productId: line.productId,
    sku: line.sku,
    nameFr: line.nameFr ?? line.name,
    nameAr: line.nameAr ?? '',
    quantityOrdered: line.quantityOrdered ?? line.qty,
    quantityReceived: line.quantityReceived ?? 0,
    unitPriceHT: line.unitPriceHT,
    tvaRate: line.tvaRate ?? 'standard',
  })),
  totalHT: raw.amountHT ?? raw.totalHT,
  totalTVA: raw.amountTVA ?? raw.totalTVA,
  totalTTC: raw.amountTTC ?? raw.totalTTC,
  status: raw.state ?? raw.status,
  createdBy: raw.createdBy,
  approvedBy: raw.approvedBy ?? null,
  rejectedBy: raw.rejectedBy ?? null,
  rejectionReason: raw.rejectionReason ?? null,
  autoCancelAt: raw.autoCancelAt ?? null,
  expectedDeliveryDate: raw.expectedDeliveryDate ?? null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const transformBCList = (rawList) => rawList.map(transformBC);

module.exports = { transformBC, transformBCList };