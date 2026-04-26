const env = require('../config/env');
const { inventoryItems } = require('../mocks/inventory.mock');
const procurementMock = require('../mocks/procurement.mock');
const { transformBC, transformBCList } = require('../transformers/procurement.transformer');
const { AppError } = require('../errors/AppError');
const inventoryService = require('./inventory.service');
const { resolveProduct } = require('./cross-module.helpers');

const sanitizeRef = (value) =>
  String(value ?? 'AUTO')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 16);

const normalizeBCItem = (item, nextIndex, index) => {
  const product = resolveProduct(item.sku, item.productId);

  return {
    productId: product?.id ?? item.productId ?? `PRD-${nextIndex}-${index + 1}`,
    sku: product?.sku ?? item.sku ?? `SKU-${nextIndex}-${index + 1}`,
    nameFr: product?.nameFr ?? item.nameFr ?? `Produit ${index + 1}`,
    nameAr: product?.nameAr ?? item.nameAr ?? '',
    quantityOrdered: item.quantityOrdered,
    quantityReceived: item.quantityReceived ?? 0,
    unitPriceHT: item.unitPriceHT,
    tvaRate: item.tvaRate ?? 'standard',
  };
};

const ensureInventoryItemForReceipt = (item) => {
  const product = resolveProduct(item.sku, item.productId);
  const resolvedSku = product?.sku ?? item.sku;

  let inventoryItem = inventoryItems.find(
    (entry) =>
      entry.sku === resolvedSku ||
      (product?.id && entry.productId === product.id) ||
      (item.productId && entry.productId === item.productId),
  );

  if (inventoryItem) {
    inventoryItem.productId = inventoryItem.productId ?? product?.id ?? item.productId;
    return inventoryItem;
  }

  const now = new Date().toISOString();
  const reorderPoint = Math.max(
    1,
    Math.round((product?.stockManagement?.qteReappro ?? 40) / 5),
  );

  inventoryItem = {
    sku: resolvedSku,
    productId: product?.id ?? item.productId ?? `PRD-PROC-${Date.now()}`,
    mdmRef: `PROC-${sanitizeRef(product?.id ?? resolvedSku)}`,
    stock: 0,
    quantityQuarantined: 0,
    reorderPoint,
    fifoLayers: [],
    returns: [],
    alerts: [],
    suggestedReorderQty: product?.stockManagement?.qteReappro ?? reorderPoint * 4,
    lastMovementAt: now,
  };

  inventoryItems.unshift(inventoryItem);
  return inventoryItem;
};

const getBCs = async ({ page = 1, pageSize = 20, status } = {}) => {
  if (env.useMock) {
    let results = [...procurementMock];
    if (status) results = results.filter((bc) => bc.status === status);
    const total = results.length;
    const data = results.slice((page - 1) * pageSize, page * pageSize);
    return { data, meta: { total, page, pageSize } };
  }
  const res = await fetch(`${env.engineBUrl}/api/bons-commande?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`);
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return { data: transformBCList(json.data ?? json), meta: json.meta };
};

const getBCById = async (id) => {
  if (env.useMock) {
    return procurementMock.find((bc) => bc.id === id) ?? null;
  }
  const res = await fetch(`${env.engineBUrl}/api/bons-commande/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const approveBC = async (id, approverId) => {
  if (env.useMock) {
    const bc = procurementMock.find((b) => b.id === id);
    if (!bc) return null;
    if (bc.createdBy === approverId) {
      throw new AppError('SOD_VIOLATION', 'Le créateur ne peut pas approuver son propre BC.', 403);
    }
    bc.status = 'Approved';
    bc.approvedBy = approverId;
    bc.updatedAt = new Date().toISOString();
    return bc;
  }
  const res = await fetch(`${env.engineBUrl}/api/bons-commande/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedBy: approverId }),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const rejectBC = async (id, rejecterId, reason) => {
  if (env.useMock) {
    const bc = procurementMock.find((b) => b.id === id);
    if (!bc) return null;
    bc.status = 'Rejected';
    bc.rejectedBy = rejecterId;
    bc.rejectionReason = reason;
    bc.updatedAt = new Date().toISOString();
    return bc;
  }
  const res = await fetch(`${env.engineBUrl}/api/bons-commande/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectedBy: rejecterId, reason }),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const createBC = async (payload, creatorId) => {
  if (env.useMock) {
    const now = new Date().toISOString();
    const items = payload.items ?? [];
    const totalHT = items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitPriceHT,
      0,
    );
    const totalTVA = items.reduce((sum, item) => {
      const rate = item.tvaRate === 'reduced' ? 0.09 : item.tvaRate === 'exempt' ? 0 : 0.19;
      return sum + item.quantityOrdered * item.unitPriceHT * rate;
    }, 0);
    const totalTTC = totalHT + totalTVA;
    const nextIndex = procurementMock.length + 1;
    const year = new Date().getFullYear();
    const reference = `BC-${year}-${String(nextIndex).padStart(3, '0')}`;

    const bc = {
      id: reference,
      reference,
      supplierId: payload.supplierId ?? `SUPP-${String(nextIndex).padStart(3, '0')}`,
      supplierName: payload.supplierName ?? 'Fournisseur',
      wilayaCode: payload.wilayaCode ?? '16',
      items: items.map((item, index) => normalizeBCItem(item, nextIndex, index)),
      totalHT,
      totalTVA,
      totalTTC,
      status: 'PendingApproval',
      createdBy: creatorId,
      approvedBy: null,
      rejectedBy: null,
      rejectionReason: null,
      autoCancelAt: null,
      expectedDeliveryDate: payload.expectedDeliveryDate ?? null,
      createdAt: now,
      updatedAt: now,
    };

    procurementMock.unshift(bc);
    return bc;
  }

  const res = await fetch(`${env.engineBUrl}/api/bons-commande`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const receiveBC = async (id, items, receiverId) => {
  if (env.useMock) {
    const bc = procurementMock.find((b) => b.id === id);
    if (!bc) return null;

    const receivedBySku = new Map(
      (items ?? []).map((item) => [item.sku, Number(item.quantityReceived) || 0]),
    );

    bc.items = bc.items.map((item) => {
      const increment = receivedBySku.get(item.sku);
      if (increment === undefined) return item;
      return {
        ...item,
        quantityReceived: Math.min(
          item.quantityOrdered,
          Math.max(0, item.quantityReceived + increment),
        ),
      };
    });

    for (const item of bc.items) {
      const increment = receivedBySku.get(item.sku);
      if (!increment || increment <= 0) continue;

      const inventoryItem = ensureInventoryItemForReceipt(item);
      await inventoryService.createMovement({
        sku: inventoryItem.sku,
        type: 'receipt',
        quantity: increment,
        reason: `Reception BC ${bc.reference}`,
        unitCostHT: item.unitPriceHT,
        referenceId: bc.reference,
      });
    }

    const fullyReceived = bc.items.every(
      (item) => item.quantityReceived >= item.quantityOrdered,
    );

    bc.status = fullyReceived ? 'FullyReceived' : 'PartiallyReceived';
    bc.updatedAt = new Date().toISOString();
    bc.lastReceivedBy = receiverId;
    return bc;
  }

  const res = await fetch(`${env.engineBUrl}/api/bons-commande/${id}/receive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, receivedBy: receiverId }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const getSuppliers = async () => {
  if (env.useMock) {
    const suppliers = procurementMock.reduce((acc, bc) => {
      const current = acc.get(bc.supplierId) ?? {
        id: bc.supplierId,
        name: bc.supplierName,
        wilayaCode: bc.wilayaCode,
        phone: '+213 (0) 550 000 000',
        email: `${bc.supplierId.toLowerCase()}@ferza.dz`,
        totalBCs: 0,
      };
      current.totalBCs += 1;
      acc.set(bc.supplierId, current);
      return acc;
    }, new Map());

    return Array.from(suppliers.values());
  }

  const res = await fetch(`${env.engineBUrl}/api/bons-commande/suppliers`);
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
};

const getAlerts = async () => {
  if (env.useMock) {
    const alerts = procurementMock.flatMap((bc) => {
      const entries = [];
      if (bc.status === 'PendingApproval') {
        entries.push({
          id: `approval-${bc.id}`,
          type: 'approval',
          severity: 'warning',
          reference: bc.reference,
          message: `${bc.reference} attend l'approbation SoD.`,
        });
      }

      if (bc.expectedDeliveryDate) {
        entries.push({
          id: `delivery-${bc.id}`,
          type: 'delivery',
          severity:
            new Date(bc.expectedDeliveryDate).getTime() < Date.now() ? 'error' : 'info',
          reference: bc.reference,
          message: `${bc.reference} attendu le ${bc.expectedDeliveryDate.split('T')[0]}.`,
        });
      }

      const hasMissingReceipt = bc.items.some(
        (item) => item.quantityReceived < item.quantityOrdered,
      );

      if (hasMissingReceipt && ['Approved', 'SentToSupplier', 'PartiallyReceived'].includes(bc.status)) {
        entries.push({
          id: `receipt-${bc.id}`,
          type: 'receipt',
          severity: 'warning',
          reference: bc.reference,
          message: `${bc.reference} a encore des quantités à réceptionner.`,
        });
      }

      return entries;
    });

    return alerts;
  }

  const res = await fetch(`${env.engineBUrl}/api/bons-commande/alerts`);
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
};

module.exports = {
  getBCs,
  getBCById,
  approveBC,
  rejectBC,
  createBC,
  receiveBC,
  getSuppliers,
  getAlerts,
};
