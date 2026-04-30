const { requestEngineA, requestMdm } = require('./backend-client');

const TVA_RATE_MAP = {
  standard: 0.19,
  reduced: 0.09,
  exempt: 0,
};

const RETURN_POLICY_TO_LABEL = {
  RETURNABLE_7D: 'Retours 7 jours',
  RETURNABLE_15D: 'Retours 15 jours',
  NON_RETURNABLE: 'Non retournable',
  PARTIAL_RETURN: 'Retour partiel',
};

const LABEL_TO_RETURN_POLICY = {
  'retours 7 jours': 'RETURNABLE_7D',
  'retour 7 jours': 'RETURNABLE_7D',
  'retours 15 jours': 'RETURNABLE_15D',
  'retour 15 jours': 'RETURNABLE_15D',
  'non retournable': 'NON_RETURNABLE',
  'retour partiel': 'PARTIAL_RETURN',
};

const BACKEND_TO_FRONT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  DISCONTINUED: 'discontinued',
  OCR_IMPORT: 'ocr_import',
};

const FRONT_TO_BACK_STATUS = {
  active: 'ACTIVE',
  draft: 'DRAFT',
  discontinued: 'DISCONTINUED',
  ocr_import: 'OCR_IMPORT',
};

const round = (value) => (value === null || value === undefined ? 0 : Number(value));

const normalizeReturnRate = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return numeric > 1 ? numeric / 100 : numeric;
};

const toFriendlyReturnPolicy = (value) => RETURN_POLICY_TO_LABEL[value] ?? value ?? 'Retours 7 jours';

const toBackendReturnPolicy = (value) => {
  if (!value) return 'RETURNABLE_7D';
  if (RETURN_POLICY_TO_LABEL[value]) return value;

  return LABEL_TO_RETURN_POLICY[String(value).trim().toLowerCase()] ?? 'RETURNABLE_7D';
};

const toFrontendStatus = (value) => BACKEND_TO_FRONT_STATUS[value] ?? 'draft';
const toBackendStatus = (value) => FRONT_TO_BACK_STATUS[value] ?? null;

const toTvaRate = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'standard';
  if (Math.abs(numeric - TVA_RATE_MAP.reduced) < 0.0001) return 'reduced';
  if (Math.abs(numeric - TVA_RATE_MAP.exempt) < 0.0001) return 'exempt';
  return 'standard';
};

const toTaxRateNumber = (value) => TVA_RATE_MAP[value] ?? TVA_RATE_MAP.standard;

const productQuery = (params = {}) => ({
  search: params.search || undefined,
  category: params.categoryId || params.category || undefined,
  status: params.status ? toBackendStatus(params.status) : undefined,
  supplier: params.supplierCode || params.supplier || undefined,
  page: Math.max(Number(params.page || 1) - 1, 0),
  size: Number(params.pageSize || params.size || 20),
});

const getSupplierName = async (user, supplierCode, cache) => {
  if (!supplierCode) return '';
  if (cache.has(supplierCode)) return cache.get(supplierCode);

  const response = await requestMdm(user, `/mdm/v1/suppliers/${encodeURIComponent(supplierCode)}`, {
    allow404: true,
  });
  const supplierName = response?.data?.companyName ?? supplierCode;
  cache.set(supplierCode, supplierName);
  return supplierName;
};

const fetchProductCore = async (user, productId) => {
  const response = await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}`);
  return response?.data ?? null;
};

const fetchProductBySku = async (user, sku) => {
  const response = await requestEngineA(user, '/pim/v1/products', {
    query: { search: sku, page: 0, size: 25 },
  });

  const items = response?.data ?? [];
  return items.find((item) => item.skuCode === sku) ?? null;
};

const mapVariant = (variant) => ({
  variantId: variant.variantId,
  sku: variant.skuCode,
  attributes: {},
  priceTTC: round(variant.priceOverride),
  stock: Number(variant.stockQuantity ?? 0),
  stockThreshold: Number(variant.stockThreshold ?? 0),
});

const mapPriceHistory = (entry) => ({
  timestamp: entry.changedAt,
  type: String(entry.changeType || '').toLowerCase(),
  fromPriceHT: entry.oldValue === null || entry.oldValue === undefined ? null : round(entry.oldValue),
  toPriceHT: entry.newValue === null || entry.newValue === undefined ? null : round(entry.newValue),
  fromPriceTTC: entry.oldValue === null || entry.oldValue === undefined ? null : round(entry.oldValue),
  toPriceTTC: entry.newValue === null || entry.newValue === undefined ? null : round(entry.newValue),
  by: entry.changedBy || 'Systeme',
});

const buildFrontendProduct = ({
  core,
  price,
  history,
  logistics,
  media,
  attributes,
  variants,
  supplierName,
}) => ({
  id: core.productId,
  sku: core.skuCode,
  nameFr: core.nameFr ?? '',
  nameAr: core.nameAr ?? '',
  descriptionFr: core.descriptionFr ?? '',
  descriptionAr: core.descriptionAr ?? '',
  categoryId: core.categoryCode ?? '',
  brandId: core.brand ?? '',
  supplierName: supplierName || core.supplierCode || core.brand || '',
  supplierRef: core.supplierRef ?? '',
  priceHT: round(price?.priceHt),
  tvaRate: toTvaRate(price?.taxRate),
  priceTTC: round(price?.priceTtc),
  costFifo: round(price?.costFifo),
  status: toFrontendStatus(core.status),
  signaled: Boolean(core.flagged) || normalizeReturnRate(core.returnRate) >= 0.3,
  returnRate: normalizeReturnRate(core.returnRate),
  stockSeuil: Number(logistics?.stockAlertThreshold ?? 0),
  mdmConfirmed: core.skuStatus === 'ACTIVE',
  variants: (variants ?? []).map(mapVariant),
  mediaUrls: (media ?? []).map((entry) => entry.fileUrl).filter(Boolean),
  weightKg:
    logistics?.weightGrams === null || logistics?.weightGrams === undefined
      ? 0
      : Number(logistics.weightGrams) / 1000,
  dimensions:
    logistics?.lengthCm || logistics?.widthCm || logistics?.heightCm
      ? {
          lengthCm: round(logistics.lengthCm),
          widthCm: round(logistics.widthCm),
          heightCm: round(logistics.heightCm),
        }
      : null,
  wilayasRestreintes: (logistics?.restrictions ?? []).map((entry) => entry.wilayaCode),
  returnPolicy: toFriendlyReturnPolicy(core.returnPolicy),
  createdBy: core.createdBy ?? '',
  createdAt: core.createdAt ?? new Date().toISOString(),
  updatedAt: core.updatedAt ?? core.createdAt ?? new Date().toISOString(),
  updatedBy: core.updatedBy ?? core.createdBy ?? '',
  totalStock: Number(core.totalStock ?? 0),
  attributes: (attributes ?? []).map((entry) => ({
    name: entry.key,
    valueFr: entry.valueFr ?? '',
    valueAr: entry.valueAr ?? '',
    unit: entry.unit ?? '',
  })),
  priceHistory: (history ?? []).map(mapPriceHistory),
  emballage: {
    poidsEmballage: round(logistics?.packagingWeightGrams),
    typeEmballage: logistics?.packagingType ?? 'Boite carton',
    fragile: Boolean(logistics?.fragile),
  },
  stockManagement: {
    qteReappro: Number(logistics?.reorderQuantity ?? 0),
    delaiReappro: Number(logistics?.reorderLeadDays ?? 0),
    reapproAuto: Boolean(logistics?.autoReorderEnabled),
  },
});

const loadProductBundle = async (
  user,
  productIdOrCore,
  options = {},
) => {
  const supplierCache = options.supplierCache ?? new Map();
  const core =
    typeof productIdOrCore === 'string'
      ? await fetchProductCore(user, productIdOrCore)
      : productIdOrCore;

  if (!core) return null;

  const productId = core.productId;

  const [
    priceResponse,
    historyResponse,
    logisticsResponse,
    mediaResponse,
    attributeResponse,
    variantResponse,
    supplierName,
  ] = await Promise.all([
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/pricing`, { allow404: true }),
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/pricing/history`, { allow404: true }),
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/logistics`, { allow404: true }),
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/media`, { allow404: true }),
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/attributes`, { allow404: true }),
    requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/variants`, { allow404: true }),
    getSupplierName(user, core.supplierCode, supplierCache),
  ]);

  return buildFrontendProduct({
    core,
    price: priceResponse?.data ?? null,
    history: historyResponse?.data ?? [],
    logistics: logisticsResponse?.data ?? null,
    media: mediaResponse?.data ?? [],
    attributes: attributeResponse?.data ?? [],
    variants: variantResponse?.data ?? [],
    supplierName,
  });
};

const searchProductBundles = async (user, params = {}) => {
  const response = await requestEngineA(user, '/pim/v1/products', {
    query: productQuery(params),
  });
  const supplierCache = new Map();
  const items = await Promise.all(
    (response?.data ?? []).map((core) =>
      loadProductBundle(user, core, { supplierCache }),
    ),
  );

  return {
    data: items.filter(Boolean),
    pagination: response?.pagination ?? {
      page: 0,
      size: Number(params.pageSize || params.size || 20),
      totalElements: items.length,
      totalPages: 1,
    },
  };
};

module.exports = {
  TVA_RATE_MAP,
  fetchProductBySku,
  fetchProductCore,
  loadProductBundle,
  normalizeReturnRate,
  requestEngineA,
  requestMdm,
  searchProductBundles,
  toBackendReturnPolicy,
  toBackendStatus,
  toFriendlyReturnPolicy,
  toTaxRateNumber,
  toTvaRate,
};
