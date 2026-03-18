const transformCustomer = (raw) => ({
  id: raw.customerId ?? raw.id,
  phone: raw.phone ?? raw.mobilePhone,
  nameFr: raw.nameFr ?? raw.fullNameFr ?? raw.name,
  nameAr: raw.nameAr ?? raw.fullNameAr ?? '',
  email: raw.email ?? null,
  wilayaCode: raw.wilayaCode,
  address: raw.address ?? '',
  segment: raw.segment ?? 'standard',
  blacklisted: raw.blacklisted ?? false,
  blacklistReason: raw.blacklistReason ?? null,
  riskLevel: raw.riskLevel ?? 'LOW',
  fraudScore: raw.fraudScore ?? null,
  totalOrders: raw.totalOrders ?? 0,
  totalSpentTTC: raw.totalSpentTTC ?? 0,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const transformCustomerList = (rawList) => rawList.map(transformCustomer);

module.exports = { transformCustomer, transformCustomerList };