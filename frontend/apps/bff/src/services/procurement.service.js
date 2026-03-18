const env = require('../config/env');
const procurementMock = require('../mocks/procurement.mock');
const { transformBC, transformBCList } = require('../transformers/procurement.transformer');
const { AppError } = require('../errors/AppError');

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

module.exports = { getBCs, getBCById, approveBC, rejectBC };