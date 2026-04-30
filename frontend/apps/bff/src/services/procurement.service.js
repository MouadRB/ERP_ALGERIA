const env = require('../config/env');
const { transformBC, transformBCList } = require('../transformers/procurement.transformer');
const { AppError } = require('../errors/AppError');

const sanitizeRef = (value) =>
  String(value ?? 'AUTO')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 16);

const authHeaders = (token) =>
  token ? { Authorization: token } : {};

const getBCs = async ({ page = 1, pageSize = 20, status } = {}, token) => {
  const qs = new URLSearchParams({ Page: String(page), PageSize: String(pageSize) });
  if (status) qs.set('Status', status);
  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders?${qs}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  const items = json.items ?? json.data ?? (Array.isArray(json) ? json : []);
  return {
    data: transformBCList(items),
    meta: {
      total: json.totalCount ?? json.total ?? items.length,
      page: json.page ?? page,
      pageSize: json.pageSize ?? pageSize,
    },
  };
};

const getBCById = async (id, token) => {
  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders/${id}`, {
    headers: authHeaders(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformBC(await res.json());
};

const approveBC = async (id, _approverId, token) => {
  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return getBCById(id, token);
};

const rejectBC = async (id, _rejecterId, _reason, token) => {
  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return getBCById(id, token);
};

const createBC = async (payload, _creatorId, token) => {
  let supplierId = payload.supplierId;
  if (!supplierId) {
    const suppliers = await getSuppliers(token);
    const match = suppliers.find(
      (s) => s.name?.toLowerCase() === (payload.supplierName ?? '').toLowerCase().trim(),
    );
    if (!match) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Fournisseur "${payload.supplierName}" introuvable. Vérifiez le nom ou ajoutez-le d'abord.`,
        400,
      );
    }
    supplierId = match.id;
  }

  const PRIORITY_MAP = { normal: 0, urgent: 1, high: 2, low: 3 };
  const priorityInt = PRIORITY_MAP[payload.priority?.toLowerCase()] ?? 0;

  const enginePayload = {
    SupplierId: supplierId,
    Priority: priorityInt,
    Warehouse: payload.warehouse?.split(' (')[0]?.trim() ?? 'Alger WH-01',
    BudgetAvailable: payload.budgetAvailable ?? 999999999,
    TransportCost: payload.transportCost ?? 0,
    CustomsCost: payload.customsCost ?? 0,
    Notes: payload.notes ?? null,
    Lines: (payload.items ?? []).map((item) => ({
      Sku: item.sku ?? '',
      ProductName: item.nameFr ?? item.sku ?? 'Article',
      Quantity: item.quantityOrdered ?? 1,
      UnitPrice: item.unitPriceHT ?? 0,
    })),
  };

  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(enginePayload),
  });
  if (!res.ok) {
    let msg = `Engine B error: ${res.status}`;
    try { const b = await res.json(); msg = b.error ?? b.title ?? msg; } catch {}
    throw new AppError('CREATE_ERROR', msg, res.status);
  }
  return transformBC(await res.json());
};

const receiveBC = async (id, items, receiverId, token) => {
  const detailRes = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders/${id}`, {
    headers: authHeaders(token),
  });
  if (detailRes.status === 404) return null;
  if (!detailRes.ok) throw new Error(`Engine B error fetching PO detail: ${detailRes.status}`);
  const detail = await detailRes.json();

  const skuToLineId = new Map(
    (detail.lines ?? []).map((line) => [(line.sku ?? '').toLowerCase(), line.id]),
  );

  const lines = (items ?? [])
    .filter((item) => item.quantityReceived > 0 && skuToLineId.has((item.sku ?? '').toLowerCase()))
    .map((item) => ({
      PurchaseOrderLineId: skuToLineId.get((item.sku ?? '').toLowerCase()),
      ReceivedQuantity: item.quantityReceived,
    }));

  if (lines.length === 0) throw new AppError('VALIDATION_ERROR', 'Aucun article à réceptionner avec les SKU correspondants.', 400);

  const enginePayload = {
    ReceiptNumber: `RCP-${Date.now()}`,
    ReceivedBy: receiverId ?? 'Inventory Manager',
    Lines: lines,
  };

  const res = await fetch(`${env.engineBUrl}/api/procurement/purchase-orders/${id}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(enginePayload),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    let msg = `Engine B error: ${res.status}`;
    try { const b = await res.json(); msg = b.error ?? b.message ?? msg; } catch {}
    throw new AppError('RECEIVE_ERROR', msg, res.status);
  }
  return getBCById(id, token);
};

const getSuppliers = async (token) => {
  const res = await fetch(`${env.engineBUrl}/api/procurement/suppliers`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
};

const getAlerts = async (token) => {
  const res = await fetch(`${env.engineBUrl}/api/procurement/stock-alerts`, {
    headers: authHeaders(token),
  });
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
