// Maps engine-b integer enum to frontend string status.
// engine-b: Draft=0, PendingApproval=1, Approved=2, SentToSupplier=3,
//           PartiallyReceived=4, Received=5, Cancelled=6
const STATUS_INT_MAP = {
  0: 'Draft',
  1: 'PendingApproval',
  2: 'Approved',
  3: 'SentToSupplier',
  4: 'PartiallyReceived',
  5: 'FullyReceived',
  6: 'Cancelled',
};

const transformStatus = (status) => {
  if (typeof status === 'number') return STATUS_INT_MAP[status] ?? 'Draft';
  if (typeof status === 'string' && status in STATUS_INT_MAP) return STATUS_INT_MAP[status];
  return status ?? 'Draft';
};

const transformLine = (line) => ({
  productId: line.id ?? line.productId ?? '',
  sku: line.sku ?? '',
  nameFr: line.nameFr ?? line.productName ?? line.name ?? '',
  nameAr: line.nameAr ?? '',
  quantityOrdered: line.quantityOrdered ?? line.quantity ?? 0,
  quantityReceived: line.quantityReceived ?? line.receivedQuantity ?? 0,
  unitPriceHT: line.unitPriceHT ?? line.unitPrice ?? 0,
  tvaRate: line.tvaRate ?? 'standard',
});

const transformBC = (raw) => ({
  id: String(raw.id ?? raw.bcId ?? ''),
  reference: raw.reference ?? '',
  supplierId: raw.supplierId ?? '',
  supplierName: raw.supplierName ?? raw.supplier?.name ?? '',
  wilayaCode: raw.wilayaCode ?? raw.supplier?.wilayaCode ?? '16',
  items: (raw.lines ?? raw.items ?? []).map(transformLine),
  totalHT: raw.totalHT ?? raw.amountHT ?? raw.subtotal ?? raw.amount ?? 0,
  totalTVA: raw.totalTVA ?? raw.amountTVA ?? 0,
  totalTTC: raw.totalTTC ?? raw.amountTTC ?? raw.totalAmount ?? raw.amount ?? 0,
  status: transformStatus(raw.status ?? raw.state),
  createdBy: raw.createdBy ?? '',
  approvedBy: raw.approvedBy ?? null,
  rejectedBy: raw.rejectedBy ?? null,
  rejectionReason: raw.rejectionReason ?? null,
  autoCancelAt: raw.autoCancelAt ?? null,
  expectedDeliveryDate: raw.expectedDeliveryDate ?? raw.etaDate ?? null,
  createdAt: raw.createdAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
});

const transformBCList = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(transformBC);
};

module.exports = { transformBC, transformBCList, transformStatus };
