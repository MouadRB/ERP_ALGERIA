const env = require('../config/env');
const { AppError } = require('../errors/AppError');
const { products, ocrQueue } = require('../mocks/pim.mock');
const { issueProvisioningTokens } = require('../lib/backend-auth');
const {
  TVA_RATE_MAP,
  fetchProductBySku,
  loadProductBundle,
  normalizeReturnRate,
  requestEngineA,
  requestMdm,
  searchProductBundles,
  toBackendReturnPolicy,
  toTaxRateNumber,
} = require('../lib/pim-engine');
const inventoryService = require('./inventory.service');

const paginate = (rows, page = 1, pageSize = 20) => {
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    meta: { total, page, pageSize },
  };
};

const sortRows = (rows, sortBy = 'updatedAt', sortOrder = 'desc') => {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = left[sortBy];
    const b = right[sortBy];

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * direction;
    }

    return String(a ?? '').localeCompare(String(b ?? '')) * direction;
  });
};

const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

const generateSkuCode = (payload = {}) =>
  payload.sku?.trim().toUpperCase() || `SKU-${Date.now()}`;

const generateSupplierCode = (supplierName = '') => {
  const stem = slugify(supplierName).slice(0, 12) || 'SUPPLIER';
  return `SUP-${stem}-${String(Date.now()).slice(-4)}`;
};

const toFileName = (url, fallback = 'media') => {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split('/').filter(Boolean).pop();
    return name || `${fallback}.jpg`;
  } catch {
    return `${fallback}.jpg`;
  }
};

const tvaRateFromPrice = (payload = {}) => payload.tvaRate || 'standard';

const enrichWithStock = (product) => {
  if (!product) return product;
  const stock = inventoryService.getStockForProduct({
    sku: product.sku,
    productId: product.id,
  });
  return { ...product, stock };
};

const buildProduct = (payload = {}) => {
  const count = products.length + 1;
  const generatedSku = payload.sku || `SKU-${String(count).padStart(4, '0')}`;
  const now = new Date().toISOString();
  const priceTTC = Number(payload.priceTTC ?? 0);
  const priceHT = payload.priceHT ?? Math.round(priceTTC / 1.19);

  const variants =
    payload.variants && payload.variants.length > 0
      ? payload.variants
      : [
          {
            variantId: `${generatedSku}-MAIN`,
            sku: generatedSku,
            attributes: { format: 'Standard' },
            priceTTC,
          },
        ];

  const seededHistory = payload.priceHistory ?? [
    {
      timestamp: now,
      type: 'creation',
      fromPriceHT: null,
      toPriceHT: priceHT,
      fromPriceTTC: null,
      toPriceTTC: priceTTC,
      by: payload.createdBy || 'Product Manager',
    },
  ];

  return {
    id: payload.id || `PRD-${String(count).padStart(3, '0')}`,
    sku: generatedSku,
    barcode: payload.barcode || `61398765${String(Date.now()).slice(-5)}`,
    nameFr: payload.nameFr || 'Nouveau produit',
    nameAr: payload.nameAr || '',
    descriptionFr: payload.descriptionFr || '',
    descriptionAr: payload.descriptionAr || '',
    categoryId: payload.categoryId || 'Divers',
    brandId: payload.brandId || payload.supplierName || 'Ferza',
    supplierName: payload.supplierName || 'Ferza Studio',
    supplierRef: payload.supplierRef || generatedSku,
    priceHT,
    tvaRate: payload.tvaRate || 'standard',
    priceTTC,
    costFifo: Number(payload.costFifo ?? 0),
    status: payload.status || 'draft',
    signaled: Boolean(payload.signaled),
    returnRate: Number(payload.returnRate ?? 0),
    mdmConfirmed: Boolean(payload.mdmConfirmed),
    returnPolicy: payload.returnPolicy || 'Retours 7 jours',
    wilayasRestreintes: payload.wilayasRestreintes ?? [],
    variants,
    priceHistory: seededHistory,
    mediaUrls: payload.mediaUrls ?? [],
    weightKg: Number(payload.weightKg ?? 0),
    dimensions: payload.dimensions ?? null,
    emballage: payload.emballage ?? {
      poidsEmballage: 0,
      typeEmballage: 'Boite carton',
      fragile: false,
    },
    stockManagement: payload.stockManagement ?? {
      qteReappro: 0,
      delaiReappro: 7,
      reapproAuto: false,
    },
    attributes: payload.attributes ?? [],
    createdBy: payload.createdBy || 'Product Manager',
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
};

const buildFrontendQuery = (params = {}) => ({
  ...params,
  status: params.status === 'signaled' ? '' : params.status,
});

const fetchAllProductBundles = async (user, params = {}) => {
  const pageSize = 100;
  const maxPages = 5;
  const rows = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await searchProductBundles(user, {
      ...buildFrontendQuery(params),
      page,
      pageSize,
    });

    rows.push(...batch.data);
    total = Number(batch.pagination?.totalElements ?? rows.length);

    const fetched = page * pageSize;
    if (fetched >= total || batch.data.length === 0) {
      break;
    }
  }

  return { rows, total };
};

const filterRealProducts = (rows, { status, search, categoryId, supplier } = {}) => {
  let results = [...rows];

  if (status === 'signaled') {
    results = results.filter((product) => product.signaled || normalizeReturnRate(product.returnRate) >= 0.3);
  } else if (status) {
    results = results.filter((product) => product.status === status);
  }

  if (categoryId) {
    results = results.filter((product) => product.categoryId === categoryId);
  }

  if (supplier) {
    const query = supplier.toLowerCase();
    results = results.filter((product) =>
      [product.supplierName, product.brandId, product.supplierRef]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  if (search) {
    const query = search.toLowerCase();
    results = results.filter((product) =>
      [
        product.nameFr,
        product.nameAr,
        product.sku,
        product.barcode,
        product.supplierName,
        product.categoryId,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  return results;
};

const ensureCatalogueCategory = async (user, categoryCode) => {
  if (!categoryCode) return;

  const existing = await requestEngineA(user, `/catalog/v1/categories/${encodeURIComponent(categoryCode)}`, {
    allow404: true,
  });
  if (existing?.data) return;

  await requestEngineA(user, '/catalog/v1/categories', {
    method: 'POST',
    body: {
      code: categoryCode,
      nameFr: categoryCode,
      nameAr: '',
      metaTitleFr: `${categoryCode} | FERZA`.slice(0, 60),
      metaTitleAr: '',
      tvaCategoryCode: categoryCode,
      channelConfig: { web: true, whatsapp: true },
      position: 0,
    },
  });
};

const ensureTaxRuleActive = async (user, categoryCode, tvaRate) => {
  const { creatorToken, approverToken } = await issueProvisioningTokens(user, `tax-${slugify(categoryCode || 'general')}`);
  const creatorQuery = { token: creatorToken };
  const approverQuery = { token: approverToken };
  const taxRate = toTaxRateNumber(tvaRate);
  const today = new Date().toISOString().slice(0, 10);

  const resolved = await requestMdm(user, '/mdm/v1/tax-rules/resolve', {
    query: { category: categoryCode },
    allow404: true,
    token: creatorToken,
  });
  if (resolved?.data) return resolved.data;

  const existing = await requestMdm(user, '/mdm/v1/tax-rules', {
    query: { category: categoryCode, page: 0, size: 25 },
    token: creatorToken,
  });
  const draftRule = (existing?.data ?? []).find((rule) => rule.categoryCode === String(categoryCode).toUpperCase());

  if (draftRule) {
    if (draftRule.status === 'ACTIVE') return draftRule;
    await requestMdm(user, `/mdm/v1/tax-rules/${encodeURIComponent(draftRule.taxRuleCode)}/activate`, {
      method: 'PATCH',
      token: approverToken,
    });
    return requestMdm(user, '/mdm/v1/tax-rules/resolve', {
      query: { category: categoryCode },
      token: creatorToken,
    });
  }

  const taxRuleCode = `TVA_${slugify(categoryCode).slice(0, 20) || 'GENERAL'}`;
  await requestMdm(user, '/mdm/v1/tax-rules', {
    method: 'POST',
    token: creatorToken,
    body: {
      taxRuleCode,
      categoryCode,
      taxRate,
      description: `Regle TVA auto pour ${categoryCode}`,
      effectiveFrom: today,
      effectiveTo: null,
    },
  });
  await requestMdm(user, `/mdm/v1/tax-rules/${encodeURIComponent(taxRuleCode)}/activate`, {
    method: 'PATCH',
    token: approverToken,
  });

  return requestMdm(user, '/mdm/v1/tax-rules/resolve', {
    query: { category: categoryCode },
    token: creatorToken,
  });
};

const ensureSkuActive = async (user, skuCode) => {
  const { creatorToken, approverToken } = await issueProvisioningTokens(user, `sku-${skuCode}`);
  const existing = await requestMdm(user, `/mdm/v1/skus/${encodeURIComponent(skuCode)}`, {
    allow404: true,
    token: creatorToken,
  });

  if (!existing?.data) {
    await requestMdm(user, '/mdm/v1/skus', {
      method: 'POST',
      token: creatorToken,
      body: {
        skuCode,
        baseUom: 'UNIT',
        productType: 'SIMPLE',
      },
    });
  } else if (existing.data.status === 'DISCONTINUED') {
    throw new AppError('VALIDATION_ERROR', `Le SKU ${skuCode} est discontinue dans le MDM.`, 400);
  }

  const refreshed = await requestMdm(user, `/mdm/v1/skus/${encodeURIComponent(skuCode)}`, {
    token: creatorToken,
  });

  if (refreshed?.data?.status !== 'ACTIVE') {
    await requestMdm(user, `/mdm/v1/skus/${encodeURIComponent(skuCode)}/activate`, {
      method: 'PATCH',
      token: approverToken,
    });
  }

  return skuCode;
};

const ensureSupplierActive = async (user, supplierName, supplierCode) => {
  if (!supplierName && !supplierCode) return null;

  const { creatorToken, approverToken } = await issueProvisioningTokens(
    user,
    `supplier-${slugify(supplierCode || supplierName)}`,
  );

  let code = supplierCode || null;
  let response = null;

  if (code) {
    response = await requestMdm(user, `/mdm/v1/suppliers/${encodeURIComponent(code)}`, {
      allow404: true,
      token: creatorToken,
    });
  }

  if (!response?.data && supplierName) {
    const search = await requestMdm(user, '/mdm/v1/suppliers', {
      query: { search: supplierName, page: 0, size: 25 },
      token: creatorToken,
    });
    const matched = (search?.data ?? []).find(
      (entry) => String(entry.companyName || '').toLowerCase() === supplierName.toLowerCase(),
    );
    if (matched) {
      code = matched.supplierCode;
      response = { data: matched };
    }
  }

  if (!response?.data) {
    code = code || generateSupplierCode(supplierName);
    await requestMdm(user, '/mdm/v1/suppliers', {
      method: 'POST',
      token: creatorToken,
      body: {
        supplierCode: code,
        companyName: supplierName || code,
        contactName: supplierName || code,
        phone: '0000000000',
        email: '',
        address: '',
        wilayaCode: '',
        taxId: '',
        paymentTermDays: 30,
        notes: 'Cree automatiquement par le BFF PIM.',
      },
    });
    response = await requestMdm(user, `/mdm/v1/suppliers/${encodeURIComponent(code)}`, {
      token: creatorToken,
    });
  }

  const status = response?.data?.status;
  if (status === 'ACTIVE') return response.data.supplierCode;
  if (status === 'BLACKLISTED') {
    throw new AppError('VALIDATION_ERROR', `Le fournisseur ${response.data.companyName} est blacklisté dans le MDM.`, 400);
  }

  const action = status === 'SUSPENDED' ? 'reactivate' : 'activate';
  await requestMdm(user, `/mdm/v1/suppliers/${encodeURIComponent(response.data.supplierCode)}/${action}`, {
    method: 'PATCH',
    token: approverToken,
  });

  return response.data.supplierCode;
};

const syncPrice = async (user, productId, categoryCode, payload = {}) => {
  if (payload.priceTTC === undefined || payload.priceTTC === null) return;

  await ensureTaxRuleActive(user, categoryCode, tvaRateFromPrice(payload));
  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/pricing`, {
    method: 'PUT',
    body: {
      priceTtc: Number(payload.priceTTC),
      categoryCode,
    },
  });
};

const syncLogistics = async (user, productId, payload = {}) => {
  const hasLogisticsPayload =
    payload.stockSeuil !== undefined ||
    payload.weightKg !== undefined ||
    payload.dimensions !== undefined ||
    payload.emballage !== undefined ||
    payload.stockManagement !== undefined;

  if (!hasLogisticsPayload) return;

  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/logistics`, {
    method: 'PUT',
    body: {
      stockAlertThreshold: Number(payload.stockSeuil ?? payload.stockManagement?.stockAlertThreshold ?? 10),
      reorderQuantity: Number(payload.stockManagement?.qteReappro ?? 50),
      reorderLeadDays: Number(payload.stockManagement?.delaiReappro ?? 7),
      autoReorderEnabled: Boolean(payload.stockManagement?.reapproAuto),
      weightGrams:
        payload.weightKg === undefined || payload.weightKg === null
          ? null
          : Number(payload.weightKg) * 1000,
      lengthCm: payload.dimensions?.lengthCm ?? null,
      widthCm: payload.dimensions?.widthCm ?? null,
      heightCm: payload.dimensions?.heightCm ?? null,
      packagingWeightGrams: Number(payload.emballage?.poidsEmballage ?? 0),
      packagingType: payload.emballage?.typeEmballage ?? 'Boite carton',
      fragile: Boolean(payload.emballage?.fragile),
    },
  });
};

const syncRestrictions = async (user, productId, desired = []) => {
  const currentResponse = await requestEngineA(
    user,
    `/pim/v1/products/${encodeURIComponent(productId)}/logistics/restrictions`,
    { allow404: true },
  );

  const current = new Set((currentResponse?.data ?? []).map((entry) => entry.wilayaCode));
  const next = new Set((desired ?? []).filter(Boolean));

  await Promise.all(
    [...next]
      .filter((code) => !current.has(code))
      .map((code) =>
        requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/logistics/restrictions`, {
          method: 'POST',
          body: { wilayaCode: code, reason: 'BFF sync' },
        }),
      ),
  );

  await Promise.all(
    [...current]
      .filter((code) => !next.has(code))
      .map((code) =>
        requestEngineA(
          user,
          `/pim/v1/products/${encodeURIComponent(productId)}/logistics/restrictions/${encodeURIComponent(code)}`,
          { method: 'DELETE' },
        ),
      ),
  );
};

const syncMedia = async (user, productId, mediaUrls = []) => {
  const currentResponse = await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/media`, {
    allow404: true,
  });
  const current = currentResponse?.data ?? [];
  const currentByUrl = new Map(current.map((entry) => [entry.fileUrl, entry]));
  const desired = new Set((mediaUrls ?? []).filter(Boolean));

  await Promise.all(
    current
      .filter((entry) => !desired.has(entry.fileUrl))
      .map((entry) =>
        requestEngineA(
          user,
          `/pim/v1/products/${encodeURIComponent(productId)}/media/${encodeURIComponent(entry.mediaId)}`,
          { method: 'DELETE' },
        ),
      ),
  );

  await Promise.all(
    [...desired]
      .filter((url) => !currentByUrl.has(url))
      .map((url, index) =>
        requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/media`, {
          method: 'POST',
          body: {
            fileName: toFileName(url, `media-${index + 1}`),
            fileUrl: url,
            fileSizeBytes: 0,
            mimeType: 'image/jpeg',
            mediaType: index === 0 ? 'PRIMARY' : 'GALLERY',
          },
        }),
      ),
  );
};

const syncAttributes = async (user, productId, attributes = []) => {
  const currentResponse = await requestEngineA(
    user,
    `/pim/v1/products/${encodeURIComponent(productId)}/attributes`,
    { allow404: true },
  );
  const current = currentResponse?.data ?? [];

  await Promise.all(
    current.map((entry) =>
      requestEngineA(
        user,
        `/pim/v1/products/${encodeURIComponent(productId)}/attributes/${encodeURIComponent(entry.attributeId)}`,
        { method: 'DELETE' },
      ),
    ),
  );

  const cleaned = (attributes ?? []).filter((entry) => entry?.name && entry?.valueFr);
  await Promise.all(
    cleaned.map((entry) =>
      requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/attributes`, {
        method: 'POST',
        body: {
          key: entry.name,
          valueFr: entry.valueFr,
          valueAr: entry.valueAr || '',
          unit: entry.unit || '',
        },
      }),
    ),
  );
};

const createMainVariant = async (user, productId, payload = {}, skuCode) => {
  const variantSku = payload.variants?.[0]?.sku || skuCode;
  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(productId)}/variants`, {
    method: 'POST',
    body: {
      skuCode: variantSku,
      label: payload.variants?.[0]?.variantId || `${skuCode} MAIN`,
      barcode: payload.variants?.[0]?.barcode || payload.barcode || null,
      priceOverride: null,
      costOverride:
        payload.costFifo === undefined || payload.costFifo === null
          ? null
          : Number(payload.costFifo),
      stockThreshold: Number(payload.stockSeuil ?? 10),
    },
  });
};

const receiveInitialStock = async (user, skuCode, quantity, payload = {}, supplierCode = null) => {
  const initialQuantity = Number(quantity ?? 0);
  if (!Number.isFinite(initialQuantity) || initialQuantity <= 0) return;

  const stockRecord = await requestEngineA(
    user,
    `/inventory/v1/stock-records/by-sku/${encodeURIComponent(skuCode)}`,
  );

  await requestEngineA(user, `/inventory/v1/stock-records/${encodeURIComponent(stockRecord.data.stockRecordId)}/receive`, {
    method: 'POST',
    body: {
      stockRecordId: stockRecord.data.stockRecordId,
      purchaseOrderRef: `INIT-${skuCode}`,
      supplierCode,
      quantity: initialQuantity,
      unitCost: Number(payload.costFifo ?? payload.priceHT ?? payload.priceTTC ?? 1),
    },
  });
};

const getProducts = async (user, {
  page = 1,
  pageSize = 20,
  status,
  search,
  categoryId,
  supplier,
  sortBy,
  sortOrder,
} = {}) => {
  if (!env.useMock) {
    const { rows } = await fetchAllProductBundles(user, {
      search,
      status,
      categoryId,
      supplier,
    });
    const filtered = filterRealProducts(rows, { status, search, categoryId, supplier });
    const sorted = sortRows(filtered, sortBy, sortOrder);
    return paginate(sorted, Number(page), Number(pageSize));
  }

  let results = [...products];

  if (status) results = results.filter((product) => product.status === status);
  if (categoryId) results = results.filter((product) => product.categoryId === categoryId);
  if (supplier) results = results.filter((product) => product.supplierName === supplier);
  if (search) {
    const query = search.toLowerCase();
    results = results.filter((product) =>
      [product.nameFr, product.nameAr, product.sku, product.barcode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  const paged = paginate(sortRows(results, sortBy, sortOrder), page, pageSize);
  return { ...paged, data: paged.data.map(enrichWithStock) };
};

const getProductById = async (user, id) => {
  if (env.useMock) {
    const product = products.find((p) => p.id === id) ?? null;
    return enrichWithStock(product);
  }

  return loadProductBundle(user, id);
};

const createProduct = async (user, payload) => {
  if (env.useMock) {
    const product = buildProduct(payload);
    products.unshift(product);
    return product;
  }

  const skuCode = generateSkuCode(payload);
  const categoryCode = payload.categoryId || 'Divers';
  const supplierCode = await ensureSupplierActive(
    user,
    payload.supplierName || payload.brandId || '',
    payload.supplierCode,
  );

  await Promise.all([
    ensureCatalogueCategory(user, categoryCode),
    ensureTaxRuleActive(user, categoryCode, tvaRateFromPrice(payload)),
    ensureSkuActive(user, skuCode),
  ]);

  const createResponse = await requestEngineA(user, '/pim/v1/products', {
    method: 'POST',
    body: {
      skuCode,
      supplierCode,
      supplierRef: payload.supplierRef || supplierCode || skuCode,
      categoryCode,
      nameFr: payload.nameFr,
      nameAr: payload.nameAr || payload.nameFr,
      descriptionFr: payload.descriptionFr || '',
      descriptionAr: payload.descriptionAr || payload.nameAr || '',
      brand: payload.brandId || payload.supplierName || '',
      model: '',
      origin: 'IMPORTED',
      barcode: payload.barcode || null,
      returnPolicy: toBackendReturnPolicy(payload.returnPolicy),
    },
  });

  const productId = createResponse?.data?.productId;

  await createMainVariant(user, productId, payload, skuCode);
  await syncPrice(user, productId, categoryCode, payload);
  await syncLogistics(user, productId, payload);
  await syncRestrictions(user, productId, payload.wilayasRestreintes || []);
  await syncMedia(user, productId, payload.mediaUrls || []);
  await syncAttributes(user, productId, payload.attributes || []);
  await receiveInitialStock(user, skuCode, payload.initialStock, payload, supplierCode);

  return loadProductBundle(user, productId);
};

const updateProduct = async (user, id, payload) => {
  if (env.useMock) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return null;

    const current = products[index];
    const now = new Date().toISOString();

    const nextPriceHT = payload.priceHT ?? current.priceHT;
    const nextPriceTTC = payload.priceTTC ?? current.priceTTC;
    const priceChanged =
      (payload.priceHT !== undefined && payload.priceHT !== current.priceHT) ||
      (payload.priceTTC !== undefined && payload.priceTTC !== current.priceTTC);

    const history = Array.isArray(current.priceHistory) ? [...current.priceHistory] : [];
    if (priceChanged) {
      history.push({
        timestamp: now,
        type: 'price_update',
        fromPriceHT: current.priceHT,
        toPriceHT: nextPriceHT,
        fromPriceTTC: current.priceTTC,
        toPriceTTC: nextPriceTTC,
        by: payload.updatedBy || 'Product Manager',
      });
    }

    const nextVariants = payload.variants ?? current.variants;

    const updated = {
      ...current,
      ...payload,
      id: current.id,
      sku: payload.sku || current.sku,
      variants: nextVariants,
      attributes: payload.attributes ?? current.attributes,
      mediaUrls: payload.mediaUrls ?? current.mediaUrls,
      wilayasRestreintes: payload.wilayasRestreintes ?? current.wilayasRestreintes,
      priceHistory: history,
      updatedAt: now,
    };

    products[index] = updated;
    return updated;
  }

  const current = await getProductById(user, id);
  if (!current) return null;

  const categoryCode = current.categoryId;
  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: {
      nameFr: payload.nameFr,
      nameAr: payload.nameAr || payload.nameFr,
      descriptionFr: payload.descriptionFr ?? '',
      descriptionAr: payload.descriptionAr ?? '',
      brand: payload.brandId || payload.supplierName || current.brandId || '',
      model: '',
      origin: 'IMPORTED',
      barcode: payload.barcode || null,
      supplierRef: payload.supplierRef || current.supplierRef || '',
      returnPolicy: toBackendReturnPolicy(payload.returnPolicy),
    },
  });

  await syncPrice(user, id, categoryCode, payload);
  await syncLogistics(user, id, payload);
  if (payload.wilayasRestreintes) {
    await syncRestrictions(user, id, payload.wilayasRestreintes);
  }
  if (payload.mediaUrls) {
    await syncMedia(user, id, payload.mediaUrls);
  }
  if (payload.attributes) {
    await syncAttributes(user, id, payload.attributes);
  }

  return loadProductBundle(user, id);
};

const bulkUpdate = async (ids, patch) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const now = new Date().toISOString();
  const updated = [];

  ids.forEach((id) => {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return;
    const current = products[index];
    const next = { ...current, ...patch, id: current.id, updatedAt: now };

    if (patch.priceHT !== undefined || patch.priceTTC !== undefined) {
      const history = Array.isArray(current.priceHistory)
        ? [...current.priceHistory]
        : [];
      history.push({
        timestamp: now,
        type: 'price_update',
        fromPriceHT: current.priceHT,
        toPriceHT: next.priceHT,
        fromPriceTTC: current.priceTTC,
        toPriceTTC: next.priceTTC,
        by: 'Product Manager',
      });
      next.priceHistory = history;
    }

    products[index] = next;
    updated.push(next);
  });

  return updated;
};

const bulkChangeStatus = async (user, ids, status) => {
  if (env.useMock) {
    return bulkUpdate(ids, { status });
  }

  const endpointByStatus = {
    active: 'activate',
    draft: 'deactivate',
    discontinued: 'discontinue',
    archived: 'discontinue',
  };

  const action = endpointByStatus[status];
  if (!action) {
    throw new AppError('VALIDATION_ERROR', `Le statut ${status} n est pas supporte par le backend PIM.`, 400);
  }

  const updated = [];
  for (const id of ids) {
    await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(id)}/${action}`, {
      method: 'PATCH',
    });
    updated.push(await loadProductBundle(user, id));
  }

  return updated;
};

const bulkChangeTva = async (user, ids, tvaRate) => {
  if (env.useMock) {
    if (!Object.prototype.hasOwnProperty.call(TVA_RATE_MAP, tvaRate)) {
      throw new Error(`Invalid tvaRate: ${tvaRate}`);
    }
    return bulkUpdate(ids, { tvaRate });
  }

  throw new AppError(
    'VALIDATION_ERROR',
    'Le changement groupe de TVA n est pas expose par Engine A. La TVA depend actuellement des regles MDM de categorie.',
    400,
  );
};

const bulkChangeSupplier = async (user, ids, supplierName) => {
  if (env.useMock) {
    return bulkUpdate(ids, { supplierName });
  }

  throw new AppError(
    'VALIDATION_ERROR',
    'Le changement groupe du fournisseur n est pas supporte par le contrat backend actuel.',
    400,
  );
};

const bulkExport = async (user, ids, columns = []) => {
  const allProducts = env.useMock
    ? products
    : ids?.length
      ? await Promise.all(ids.map((id) => getProductById(user, id)))
      : (await getProducts(user, { page: 1, pageSize: 200 })).data;

  const scope = ids && ids.length > 0
    ? allProducts.filter((product) => ids.includes(product.id))
    : allProducts;

  const allColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nameFr', label: 'Nom FR' },
    { key: 'nameAr', label: 'Nom AR' },
    { key: 'categoryId', label: 'Categorie' },
    { key: 'supplierName', label: 'Fournisseur' },
    { key: 'priceHT', label: 'Prix HT' },
    { key: 'priceTTC', label: 'Prix TTC' },
    { key: 'tvaRate', label: 'TVA' },
    { key: 'status', label: 'Statut' },
    { key: 'totalStock', label: 'Stock total' },
  ];
  const selected = columns.length > 0
    ? allColumns.filter((column) => columns.includes(column.key))
    : allColumns;

  const header = selected.map((column) => column.label).join(',');
  const rows = scope.map((product) =>
    selected
      .map((column) => String(product[column.key] ?? '').replace(/,/g, ' '))
      .join(','),
  );
  return { csv: [header, ...rows].join('\n'), count: scope.length };
};

const bulkPlanReappro = async (user, ids, { date, qty }) => {
  if (env.useMock) {
    const now = new Date().toISOString();
    const affected = [];
    ids.forEach((id) => {
      const index = products.findIndex((product) => product.id === id);
      if (index === -1) return;
      const current = products[index];
      const next = {
        ...current,
        stockManagement: {
          ...(current.stockManagement || {}),
          qteReappro: Number(qty ?? current.stockManagement?.qteReappro ?? 0),
          nextReapproDate: date || null,
        },
        updatedAt: now,
      };
      products[index] = next;
      affected.push(next);
    });
    return { affected, scheduledDate: date, qty };
  }

  throw new AppError(
    'VALIDATION_ERROR',
    'La planification groupee de reapprovisionnement n est pas exposee par Engine A.',
    400,
  );
};

const addVariant = async (user, id, variant) => {
  if (env.useMock) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return null;
    const current = products[index];

    const nextVariant = {
      variantId: variant.variantId || `${current.sku}-${Date.now()}`,
      sku: variant.sku || `${current.sku}-${current.variants.length + 1}`,
      barcode: variant.barcode || null,
      attributes: variant.attributes || {},
      priceTTC: Number(variant.priceTTC ?? current.priceTTC),
      costFifo: Number(variant.costFifo ?? current.costFifo ?? 0),
    };

    const next = {
      ...current,
      variants: [...current.variants, nextVariant],
      updatedAt: new Date().toISOString(),
    };
    products[index] = next;
    return next;
  }

  const product = await getProductById(user, id);
  if (!product) return null;

  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(id)}/variants`, {
    method: 'POST',
    body: {
      skuCode: variant.sku || `${product.sku}-${product.variants.length + 1}`,
      label: variant.variantId || `${product.nameFr} ${product.variants.length + 1}`,
      barcode: variant.barcode || null,
      priceOverride:
        variant.priceTTC === undefined || variant.priceTTC === null
          ? null
          : Number(variant.priceTTC),
      costOverride:
        variant.costFifo === undefined || variant.costFifo === null
          ? null
          : Number(variant.costFifo),
      stockThreshold: Number(product.stockSeuil ?? 10),
    },
  });

  return loadProductBundle(user, id);
};

const updateRestrictions = async (user, id, { wilayasRestreintes }) => {
  if (env.useMock) {
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return null;
    const current = products[index];
    const next = {
      ...current,
      wilayasRestreintes: Array.isArray(wilayasRestreintes)
        ? wilayasRestreintes
        : current.wilayasRestreintes,
      updatedAt: new Date().toISOString(),
    };
    products[index] = next;
    return next;
  }

  await syncRestrictions(user, id, wilayasRestreintes || []);
  return loadProductBundle(user, id);
};

const archiveProduct = async (user, id) => {
  if (env.useMock) {
    const product = products.find((item) => item.id === id);
    if (!product) return null;

    product.status = 'archived';
    product.updatedAt = new Date().toISOString();
    return product;
  }

  await requestEngineA(user, `/pim/v1/products/${encodeURIComponent(id)}/discontinue`, {
    method: 'PATCH',
  });
  return loadProductBundle(user, id);
};

const importOCRProducts = async (user, payload = {}) => {
  if (!env.useMock) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Le flux OCR visible dans le frontend n est pas encore connecte au backend OCR d Engine A.',
      400,
    );
  }

  const created = ocrQueue
    .filter((item) => !products.some((product) => product.sku === item.sku))
    .map((item) =>
      buildProduct({
        ...item,
        status: 'ocr_import',
        priceHT: Math.round(item.priceTTC / 1.19),
        mediaUrls: payload.imageUrl ? [payload.imageUrl] : [],
      }),
    );

  created.forEach((item) => products.unshift(item));
  return created;
};

module.exports = {
  archiveProduct,
  createProduct,
  getProductById,
  getProducts,
  importOCRProducts,
  updateProduct,
  bulkChangeStatus,
  bulkChangeTva,
  bulkChangeSupplier,
  bulkExport,
  bulkPlanReappro,
  addVariant,
  updateRestrictions,
};
