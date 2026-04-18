const env = require('../config/env');
const { products, ocrQueue } = require('../mocks/pim.mock');
const { transformProduct, transformProductList } = require('../transformers/pim.transformer');
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

const TVA_RATE_MAP = { standard: 0.19, reduced: 0.09, exempt: 0 };

// Enrich a PIM product with live stock from Inventory (single source of truth).
// Inventory is joined on sku first, then productId, returning quantityOnHand /
// quantityAvailable / soft / hard. Frontend consumes these fields directly —
// PIM never stores stock locally.
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

const getProducts = async ({
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
    const res = await fetch(`${env.engineAUrl}/api/products?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
    const json = await res.json();
    return { data: transformProductList(json.data ?? json), meta: json.meta };
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

const getProductById = async (id) => {
  if (env.useMock) {
    const product = products.find((p) => p.id === id) ?? null;
    return enrichWithStock(product);
  }

  const res = await fetch(`${env.engineAUrl}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformProduct(await res.json());
};

const createProduct = async (payload) => {
  const product = buildProduct(payload);
  products.unshift(product);
  return product;
};

const updateProduct = async (id, payload) => {
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

const bulkChangeStatus = (ids, status) => bulkUpdate(ids, { status });

const bulkChangeTva = (ids, tvaRate) => {
  if (!TVA_RATE_MAP.hasOwnProperty(tvaRate)) {
    throw new Error(`Invalid tvaRate: ${tvaRate}`);
  }
  return bulkUpdate(ids, { tvaRate });
};

const bulkChangeSupplier = (ids, supplierName) =>
  bulkUpdate(ids, { supplierName });

const bulkExport = async (ids, columns = []) => {
  const scope = ids && ids.length > 0
    ? products.filter((product) => ids.includes(product.id))
    : products;

  const allColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nameFr', label: 'Nom FR' },
    { key: 'nameAr', label: 'Nom AR' },
    { key: 'categoryId', label: 'Catégorie' },
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

const bulkPlanReappro = async (ids, { date, qty }) => {
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
  // Placeholder: real integration lives in the Procurement module.
  return { affected, scheduledDate: date, qty };
};

const addVariant = async (id, variant) => {
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
};

const updateRestrictions = async (id, { wilayasRestreintes }) => {
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
};

const archiveProduct = async (id) => {
  const product = products.find((item) => item.id === id);
  if (!product) return null;

  product.status = 'archived';
  product.updatedAt = new Date().toISOString();
  return product;
};

const importOCRProducts = async (payload = {}) => {
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
