const env = require('../config/env');
const { catalogueEntries, categories } = require('../mocks/catalogue.mock');
const { enrichCatalogueEntryWithPIM } = require('./cross-module.helpers');
const inventoryService = require('./inventory.service');
const { requestEngineA } = require('../lib/backend-client');
const { loadProductBundle, searchProductBundles, fetchProductBySku } = require('../lib/pim-engine');

// ─── Channel / Status mappings ────────────────────────────────────────────────

const FRONT_TO_ENGINE_CHANNEL = {
  website: 'WEB',
  whatsapp: 'WHATSAPP',
};

const ENGINE_TO_FRONT_CHANNEL = {
  WEB: 'website',
  WHATSAPP: 'whatsapp',
  MARKETPLACE: 'marketplace',
};

const ENGINE_TO_FRONT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  MASKED_AUTO: 'masked',
  MASKED_MANUAL: 'masked',
  SCHEDULED: 'scheduled',
  DISCONTINUED: 'masked',
};

const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

// ─── Real-mode helpers ────────────────────────────────────────────────────────

const mapChannels = (activeChannels) =>
  (activeChannels ?? [])
    .map((ch) => ENGINE_TO_FRONT_CHANNEL[ch] ?? ch.toLowerCase())
    .filter(Boolean);

const mapStatus = (status) => ENGINE_TO_FRONT_STATUS[status] ?? 'draft';

/**
 * Merge a PIM product bundle with a CatalogProductResponse from Engine A
 * into the shape the frontend expects.
 */
const toCatalogueEntry = (pimBundle, catalogEntry) => {
  const status = mapStatus(catalogEntry?.status);
  const channels = mapChannels(catalogEntry?.activeChannels);

  const channelDetails = channels.map((chId) => ({
    id: chId,
    label: chId === 'website' ? 'Site Web' : 'WhatsApp Business',
    subtitle: chId === 'website' ? 'ferza.dz' : 'wh_cat_ferza_01',
    status: status === 'published' ? 'published' : 'draft',
    indexed: chId === 'website' && status === 'published',
    activeKeywords: 0,
    featuredPlacement: '',
    searchRank: null,
  }));

  return {
    id: pimBundle.id,
    productId: pimBundle.id,
    sku: pimBundle.sku,
    nameFr: pimBundle.nameFr,
    nameAr: pimBundle.nameAr,
    priceTTC: pimBundle.priceTTC,
    categoryId: pimBundle.categoryId,
    categoryPath: pimBundle.categoryId,
    status,
    publishedAt: status === 'published' ? (catalogEntry?.updatedAt ?? null) : null,
    channels,
    openSearchIndexed: status === 'published',
    openSearchIndexedAt: status === 'published' ? (catalogEntry?.updatedAt ?? null) : null,
    scheduledPublishAt: catalogEntry?.scheduledAt ?? null,
    scheduledUnpublishAt: catalogEntry?.autoUnpublishAt ?? null,
    channelDetails,
    visibilityRules: {
      minStock: 1,
      showOutOfStock: false,
      autoMaskOnZeroStock: (catalogEntry?.activeRules ?? []).includes('MASK_IF_STOCK_ZERO'),
      allowedWilayasCount: 48,
      hiddenWilayas: [],
    },
    metrics: {
      views7d: 0,
      addToCartRate: 0,
      conversionRate: 0,
      topSearchTerm: '',
      returnRate: pimBundle.returnRate ?? 0,
    },
    history: [],
    product: null,
    inventory: null,
    variantCount: pimBundle.variants?.length ?? 0,
    channelCount: channels.length,
    availableStock: pimBundle.totalStock ?? 0,
    reservedStock: 0,
    stockStatus: (pimBundle.totalStock ?? 0) === 0 ? 'rupture' : 'en-stock',
    allowedWilayasLabel: '48/48',
  };
};

/** Resolve a PIM bundle by productId or SKU. */
const resolvePimBundle = async (user, id) => {
  let bundle = await loadProductBundle(user, id).catch(() => null);
  if (!bundle) {
    const core = await fetchProductBySku(user, id);
    if (core) bundle = await loadProductBundle(user, core.productId).catch(() => null);
  }
  return bundle;
};

const mapCategoryNode = (cat) => ({
  id: cat.code,
  code: cat.code,
  nameFr: cat.nameFr,
  nameAr: cat.nameAr ?? '',
  parentId: null,
  slug: `/categories/${cat.code.toLowerCase()}`,
  productCount: cat.productCount ?? 0,
  active: cat.active ?? true,
  children: (cat.children ?? []).map(mapCategoryNode),
  createdAt: null,
});

// ─── Mock helpers (unchanged for mock path) ───────────────────────────────────

const DEFAULT_CHANNELS = {
  website: {
    activeKeywords: 3,
    featuredPlacement: 'Nouveautes',
    id: 'website',
    indexed: true,
    label: 'Site Web',
    searchRank: 1,
    subtitle: 'ferza.dz',
  },
  whatsapp: {
    activeKeywords: 2,
    featuredPlacement: 'Catalogue relation client',
    id: 'whatsapp',
    indexed: false,
    label: 'WhatsApp Business',
    searchRank: null,
    subtitle: 'wh_cat_ferza_01',
  },
};

const paginate = (rows, page = 1, pageSize = 20) => {
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), meta: { total, page, pageSize } };
};

const getProduct = (entry) =>
  require('../mocks/pim.mock').products.find(
    (p) => p.id === entry.productId || p.sku === entry.sku,
  ) ?? null;

const getInventory = (entry) =>
  inventoryService.getStockForProduct({ sku: entry.sku, productId: entry.productId });

const pushHistory = (entry, title, subtitle, type) => {
  entry.history.unshift({
    id: `HIST-CAT-${Date.now()}`,
    type,
    title,
    subtitle,
    actor: 'Catalogue Manager',
    at: new Date().toISOString(),
  });
};

const syncChannels = (entry) => {
  entry.channels = entry.channelDetails
    .filter((ch) => ch.status !== 'draft')
    .map((ch) => ch.id);
};

const syncStatusFromChannels = (entry) => {
  const activeCount = entry.channelDetails.filter((ch) => ch.status === 'published').length;
  const scheduledCount = entry.channelDetails.filter((ch) => ch.status === 'scheduled').length;

  if (activeCount === 0 && scheduledCount === 0) entry.status = 'draft';
  else if (activeCount > 0 && activeCount < entry.channelDetails.length) entry.status = 'partial';
  else if (activeCount === entry.channelDetails.length && activeCount > 0) entry.status = 'published';
  else if (scheduledCount > 0) entry.status = 'scheduled';

  entry.openSearchIndexed = entry.channelDetails.some(
    (ch) => ch.id === 'website' && ch.indexed,
  );
  if (entry.openSearchIndexed) entry.openSearchIndexedAt = new Date().toISOString();
  syncChannels(entry);
};

const enrichEntry = (entry) => {
  const pimEnriched = enrichCatalogueEntryWithPIM(entry);
  const product = getProduct(pimEnriched);
  const inventory = getInventory(pimEnriched);
  const variantCount = product?.variants?.length ?? 0;
  const channelCount = pimEnriched.channels.length;
  return {
    ...pimEnriched,
    product,
    inventory,
    variantCount,
    channelCount,
    availableStock: inventory?.quantityAvailable ?? 0,
    reservedStock: inventory?.quantityReserved ?? 0,
    stockStatus: inventory?.stockStatus ?? 'indisponible',
    allowedWilayasLabel: `${pimEnriched.visibilityRules.allowedWilayasCount}/48`,
  };
};

const applyFilters = (rows, { category, channel, maxPrice, minPrice, search, status, stockStatus } = {}) =>
  rows.filter((entry) => {
    if (status && entry.status !== status) return false;
    if (category && entry.categoryId !== category) return false;
    if (channel && !entry.channels.includes(channel)) return false;
    if (stockStatus && entry.stockStatus !== stockStatus) return false;
    if (typeof minPrice === 'number' && entry.priceTTC < minPrice) return false;
    if (typeof maxPrice === 'number' && entry.priceTTC > maxPrice) return false;
    if (search) {
      const q = String(search).toLowerCase();
      const matches = [entry.nameFr, entry.nameAr, entry.sku, entry.categoryId, entry.categoryPath]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

const getSortValue = (entry, sortBy) => {
  switch (sortBy) {
    case 'nameFr': return entry.nameFr;
    case 'sku': return entry.sku;
    case 'categoryId': return entry.categoryId;
    case 'priceTTC': return entry.priceTTC;
    case 'availableStock': return entry.availableStock;
    case 'status': return entry.status;
    case 'publishedAt': return entry.publishedAt ?? '';
    default: return entry.history?.[0]?.at ?? entry.openSearchIndexedAt ?? entry.publishedAt ?? '';
  }
};

const sortRows = (rows, sortBy = 'updatedAt', sortOrder = 'desc') => {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = getSortValue(a, sortBy);
    const bv = getSortValue(b, sortBy);
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
    return String(av).localeCompare(String(bv), 'fr', { numeric: true, sensitivity: 'base' }) * direction;
  });
};

const isPendingPublication = (entry) => {
  if (entry.status === 'scheduled' && entry.scheduledPublishAt) {
    return new Date(entry.scheduledPublishAt).getTime() > Date.now();
  }
  return entry.status === 'draft' || entry.status === 'en_attente';
};

const computeCatalogueStats = (items) => {
  const enriched = items.map(enrichEntry);
  const total = enriched.length;
  const published = enriched.filter((e) => e.status === 'published').length;
  const masked = enriched.filter((e) => e.status === 'masked').length;
  const scheduled = enriched.filter((e) => e.status === 'scheduled').length;
  const draft = enriched.filter((e) => e.status === 'draft').length;
  const partial = enriched.filter((e) => e.status === 'partial').length;
  const pendingPublication = enriched.filter(isPendingPublication).length;
  const rupture = enriched.filter((e) => e.stockStatus === 'rupture').length;
  const lowStock = enriched.filter((e) => e.stockStatus === 'faible').length;
  const indexed = enriched.filter((e) => e.openSearchIndexed).length;
  const totalValue = enriched.reduce(
    (sum, e) => sum + Number(e.priceTTC || 0) * (e.inventory?.quantityOnHand ?? 0),
    0,
  );
  return { total, published, masked, scheduled, draft, partial, pendingPublication, rupture, lowStock, indexed, totalValue };
};

const computeCatalogueAnalytics = (items) => {
  const enriched = items.map(enrichEntry);
  const totalViews = enriched.reduce((s, e) => s + Number(e.metrics?.views7d || 0), 0);
  const avg = (key) => {
    if (!enriched.length) return 0;
    return enriched.reduce((t, e) => t + Number(e.metrics?.[key] || 0), 0) / enriched.length;
  };
  const topByViews = [...enriched]
    .sort((a, b) => Number(b.metrics?.views7d || 0) - Number(a.metrics?.views7d || 0))
    .slice(0, 5)
    .map((e) => ({
      id: e.id, sku: e.sku, nameFr: e.nameFr, categoryId: e.categoryId,
      views7d: Number(e.metrics?.views7d || 0), conversionRate: Number(e.metrics?.conversionRate || 0), status: e.status,
    }));
  const categoryMap = new Map();
  enriched.forEach((e) => {
    const b = categoryMap.get(e.categoryId) ?? { categoryId: e.categoryId, total: 0, published: 0, views7d: 0 };
    b.total += 1;
    if (e.status === 'published') b.published += 1;
    b.views7d += Number(e.metrics?.views7d || 0);
    categoryMap.set(e.categoryId, b);
  });
  return {
    totals: {
      entries: enriched.length,
      published: enriched.filter((e) => e.status === 'published').length,
      masked: enriched.filter((e) => e.status === 'masked').length,
      scheduled: enriched.filter((e) => e.status === 'scheduled').length,
      draft: enriched.filter((e) => e.status === 'draft').length,
      views7d: totalViews,
    },
    averages: {
      addToCartRate: Number(avg('addToCartRate').toFixed(4)),
      conversionRate: Number(avg('conversionRate').toFixed(4)),
      returnRate: Number(avg('returnRate').toFixed(4)),
    },
    topProducts: topByViews,
    byCategory: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total),
  };
};

const computeChannelMetrics = (items) => {
  const knownChannels = new Map();
  items.forEach((e) => {
    e.channelDetails.forEach((ch) => {
      if (!knownChannels.has(ch.id)) knownChannels.set(ch.id, { id: ch.id, label: ch.label, subtitle: ch.subtitle });
    });
  });
  return Array.from(knownChannels.values()).map((ch) => {
    let published = 0, masked = 0, scheduled = 0, excluded = 0, totalKeywords = 0, totalSearchRank = 0, rankCount = 0;
    items.forEach((e) => {
      const detail = e.channelDetails.find((c) => c.id === ch.id);
      if (!detail) { excluded += 1; return; }
      if (detail.status === 'published') published += 1;
      else if (detail.status === 'masked') masked += 1;
      else if (detail.status === 'scheduled') scheduled += 1;
      else excluded += 1;
      totalKeywords += Number(detail.activeKeywords || 0);
      if (typeof detail.searchRank === 'number') { totalSearchRank += detail.searchRank; rankCount += 1; }
    });
    return { id: ch.id, label: ch.label, subtitle: ch.subtitle, published, masked, scheduled, excluded, totalKeywords, averageSearchRank: rankCount ? Number((totalSearchRank / rankCount).toFixed(1)) : null };
  });
};

// ─── Public API ───────────────────────────────────────────────────────────────

const getCatalogue = async (user, {
  page = 1, pageSize = 20, search, status: filterStatus, category,
  stockStatus, channel, minPrice, maxPrice, sortBy = 'updatedAt', sortOrder = 'desc',
} = {}) => {
  if (env.useMock) {
    const rows = sortRows(
      applyFilters(catalogueEntries.map(enrichEntry), { category, channel, maxPrice, minPrice, search, status: filterStatus, stockStatus }),
      sortBy, sortOrder,
    );
    return paginate(rows, page, pageSize);
  }

  // Real: fetch PIM bundles + catalogue status per SKU in parallel
  const bundleResult = await searchProductBundles(user, {
    page: Number(page),
    pageSize: Number(pageSize),
    search,
    categoryId: category,
  });

  const bundles = bundleResult.data;
  const catalogEntries = await Promise.all(
    bundles.map((b) =>
      requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(b.sku)}`, { allow404: true }),
    ),
  );

  let entries = bundles.map((b, i) => toCatalogueEntry(b, catalogEntries[i]?.data));

  if (filterStatus) entries = entries.filter((e) => e.status === filterStatus);
  if (channel) entries = entries.filter((e) => e.channels.includes(channel));

  const total = bundleResult.pagination?.totalElements ?? entries.length;
  return { data: entries, meta: { total, page: Number(page), pageSize: Number(pageSize) } };
};

const getCatalogueItem = async (user, id) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    const enriched = enrichEntry(entry);
    const relatedProducts = catalogueEntries
      .filter((item) => item.categoryId === entry.categoryId && item.id !== entry.id)
      .slice(0, 4)
      .map((item) => {
        const related = enrichCatalogueEntryWithPIM(item);
        return { id: related.id, sku: related.sku, nameFr: related.nameFr, priceTTC: related.priceTTC, status: related.status };
      });
    return {
      ...enriched,
      seo: {
        metaTitleFr: `${enriched.nameFr} | FERZA`,
        metaTitleAr: `${enriched.nameAr} | FERZA`,
        slug: `/catalogue/${entry.categoryId.toLowerCase()}/${entry.sku.toLowerCase()}`,
      },
      relatedProducts,
    };
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  const entry = toCatalogueEntry(bundle, catalogEntry?.data);

  return {
    ...entry,
    seo: {
      metaTitleFr: `${bundle.nameFr} | FERZA`,
      metaTitleAr: `${bundle.nameAr} | FERZA`,
      slug: `/catalogue/${bundle.categoryId.toLowerCase()}/${bundle.sku.toLowerCase()}`,
    },
    relatedProducts: [],
  };
};

const createCatalogueEntry = async (user, payload) => {
  if (env.useMock) {
    const sourceProduct =
      require('../mocks/pim.mock').products.find(
        (p) => p.id === payload.productId || p.sku === payload.sku,
      ) ?? null;
    const entry = {
      id: `CAT-ENTRY-${String(catalogueEntries.length + 1).padStart(3, '0')}`,
      productId: sourceProduct?.id || payload.productId || `PRD-CAT-${catalogueEntries.length + 1}`,
      sku: sourceProduct?.sku || payload.sku || `SKU-CAT-${catalogueEntries.length + 1}`,
      categoryId: sourceProduct?.categoryId || payload.categoryId || 'Divers',
      categoryPath: payload.categoryPath || sourceProduct?.categoryId || 'Divers',
      status: 'draft',
      publishedAt: null,
      channels: [],
      openSearchIndexed: false,
      openSearchIndexedAt: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      channelDetails: [],
      visibilityRules: { minStock: 1, showOutOfStock: false, autoMaskOnZeroStock: true, allowedWilayasCount: 48, hiddenWilayas: [] },
      metrics: { views7d: 0, addToCartRate: 0, conversionRate: 0, topSearchTerm: '', returnRate: sourceProduct?.returnRate ?? 0 },
      history: [{ id: `HIST-CAT-${Date.now()}`, type: 'draft', title: 'Entree catalogue creee', subtitle: 'En attente publication', actor: 'Catalogue Manager', at: new Date().toISOString() }],
    };
    catalogueEntries.unshift(entry);
    return enrichEntry(entry);
  }

  // Real: catalogue entries exist automatically once PIM product is created.
  // Resolve the product and return its current catalogue state.
  const id = payload.sku || payload.productId;
  if (!id) return null;
  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;
  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const publishEntry = async (user, id) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    entry.status = 'published';
    entry.publishedAt = new Date().toISOString();
    entry.openSearchIndexed = true;
    entry.openSearchIndexedAt = entry.publishedAt;
    entry.channelDetails = entry.channelDetails.length > 0
      ? entry.channelDetails.map((ch) => ({ ...ch, indexed: ch.id === 'website', status: 'published' }))
      : [{ ...DEFAULT_CHANNELS.website, status: 'published' }];
    syncChannels(entry);
    pushHistory(entry, 'Produit publie', 'Activation multi-canal terminee', 'publish');
    return enrichEntry(entry);
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  await requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/publish`, {
    method: 'POST',
    body: { skuCode: bundle.sku, channels: ['WEB', 'WHATSAPP'] },
  });

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const maskEntry = async (user, id) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    entry.status = 'masked';
    entry.openSearchIndexed = false;
    entry.openSearchIndexedAt = null;
    entry.channelDetails = entry.channelDetails.length > 0
      ? entry.channelDetails.map((ch) => ({ ...ch, indexed: false, status: 'masked' }))
      : [{ ...DEFAULT_CHANNELS.website, indexed: false, status: 'masked' }];
    syncChannels(entry);
    pushHistory(entry, 'Produit masque', 'Masquage manuel applique via catalogue', 'mask');
    return enrichEntry(entry);
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  // Disable all channels to trigger MASKED_MANUAL status in Engine A
  // Engine A uses @RequestParam boolean enabled — must be a query param, not body
  await Promise.all(
    ['WEB', 'WHATSAPP'].map((channel) =>
      requestEngineA(
        user,
        `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/channels/${channel}/toggle`,
        { method: 'POST', query: { enabled: false }, allow404: true },
      ),
    ),
  );

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const unpublishEntry = async (user, id) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    entry.status = 'draft';
    entry.channels = [];
    entry.channelDetails = entry.channelDetails.map((ch) => ({ ...ch, indexed: false, status: 'draft' }));
    entry.openSearchIndexed = false;
    pushHistory(entry, 'Produit de-publie', 'Retrait manuel des canaux', 'unpublish');
    return enrichEntry(entry);
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  await requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/unpublish`, {
    method: 'POST',
    body: { skuCode: bundle.sku },
  });

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const scheduleEntry = async (user, id, scheduledAt, type = 'publish') => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    if (type === 'unpublish') {
      entry.scheduledUnpublishAt = scheduledAt;
      pushHistory(entry, 'Depublication auto planifiee', `Retrait prevu le ${scheduledAt}`, 'schedule');
      return enrichEntry(entry);
    }
    entry.status = 'scheduled';
    entry.scheduledPublishAt = scheduledAt;
    entry.channelDetails = entry.channelDetails.length > 0
      ? entry.channelDetails.map((ch) => ({ ...ch, status: 'scheduled' }))
      : [{ ...DEFAULT_CHANNELS.website, indexed: false, status: 'scheduled' }];
    syncChannels(entry);
    pushHistory(entry, 'Publication planifiee', `Diffusion prevue le ${scheduledAt}`, 'schedule');
    return enrichEntry(entry);
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  if (type === 'unpublish') {
    // Engine A schedule endpoint is for publish; for unpublish just unpublish immediately
    await requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/unpublish`, {
      method: 'POST',
      body: { skuCode: bundle.sku },
    });
  } else {
    await requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/schedule`, {
      method: 'POST',
      body: { skuCode: bundle.sku, scheduledAt },
    });
  }

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const toggleChannelStatus = async (user, id, channelId, enabled) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    const existingChannel = entry.channelDetails.find((ch) => ch.id === channelId);
    const template = DEFAULT_CHANNELS[channelId] ?? {
      activeKeywords: 1, featuredPlacement: 'Canal additionnel', id: channelId,
      indexed: false, label: channelId, searchRank: null, subtitle: 'catalogue-ferza',
    };
    if (existingChannel) {
      existingChannel.status = enabled ? 'published' : 'draft';
      existingChannel.indexed = enabled && channelId === 'website';
    } else {
      entry.channelDetails.push({ ...template, status: enabled ? 'published' : 'draft' });
    }
    syncStatusFromChannels(entry);
    pushHistory(entry, enabled ? 'Canal active' : 'Canal suspendu', `${template.label} ${enabled ? 'publie' : 'retire'} via mode mock`, enabled ? 'publish' : 'unpublish');
    return enrichEntry(entry);
  }

  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  const engineChannel = FRONT_TO_ENGINE_CHANNEL[channelId] ?? channelId.toUpperCase();

  // Engine A uses @RequestParam boolean enabled — must be a query param, not body
  await requestEngineA(
    user,
    `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/channels/${engineChannel}/toggle`,
    { method: 'POST', query: { enabled } },
  );

  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const getOpenSearchStatus = async (user) => {
  if (env.useMock) {
    const indexedEntries = catalogueEntries.filter((e) => e.openSearchIndexed);
    const publishedEntries = catalogueEntries.filter((e) => e.status === 'published');
    return {
      totalIndexed: indexedEntries.length,
      totalPublished: publishedEntries.length,
      lastIndexedAt: indexedEntries.map((e) => e.openSearchIndexedAt).filter(Boolean).sort().at(-1) ?? null,
      health: indexedEntries.length >= Math.max(1, publishedEntries.length - 1) ? 'green' : 'yellow',
    };
  }

  // Try Engine A's analytics endpoint for OpenSearch status
  try {
    const response = await requestEngineA(user, '/catalog/v1/analytics', { allow404: true });
    if (response?.data) {
      const d = response.data;
      return {
        totalIndexed: d.totalIndexed ?? d.published ?? 0,
        totalPublished: d.published ?? 0,
        lastIndexedAt: null,
        health: 'green',
      };
    }
  } catch {
    // fall through
  }
  return { totalIndexed: 0, totalPublished: 0, lastIndexedAt: null, health: 'unknown' };
};

const getCatalogueStats = async (user) => {
  if (env.useMock) return computeCatalogueStats(catalogueEntries);

  try {
    const response = await requestEngineA(user, '/catalog/v1/analytics', { allow404: true });
    if (response?.data) {
      const d = response.data;
      return {
        total: (d.totalProducts ?? 0) || ((d.published ?? 0) + (d.masked ?? 0) + (d.unpublished ?? d.draft ?? 0)),
        published: d.published ?? 0,
        masked: d.masked ?? 0,
        scheduled: d.scheduled ?? 0,
        draft: d.draft ?? d.unpublished ?? 0,
        partial: 0,
        pendingPublication: 0,
        rupture: 0,
        lowStock: 0,
        indexed: d.totalIndexed ?? d.published ?? 0,
        totalValue: 0,
      };
    }
  } catch {
    // fall through
  }
  return computeCatalogueStats([]);
};

const getCatalogueAnalytics = async (user) => {
  if (env.useMock) return computeCatalogueAnalytics(catalogueEntries);

  try {
    const response = await requestEngineA(user, '/catalog/v1/analytics', { allow404: true });
    if (response?.data) {
      const d = response.data;
      return {
        totals: {
          entries: d.totalProducts ?? 0,
          published: d.published ?? 0,
          masked: d.masked ?? 0,
          scheduled: d.scheduled ?? 0,
          draft: d.draft ?? d.unpublished ?? 0,
          views7d: 0,
        },
        averages: { addToCartRate: 0, conversionRate: 0, returnRate: 0 },
        topProducts: [],
        byCategory: [],
      };
    }
  } catch {
    // fall through
  }
  return computeCatalogueAnalytics([]);
};

const CHANNEL_LABELS = {
  WEB: { label: 'Site Web', subtitle: 'ferza.dz' },
  WHATSAPP: { label: 'WhatsApp Business', subtitle: 'wh_cat_ferza_01' },
  MARKETPLACE: { label: 'Marketplace', subtitle: 'marketplace.ferza.dz' },
};

const mapSalesChannelToMetrics = (ch) => {
  const frontId = ENGINE_TO_FRONT_CHANNEL[ch.channelType] ?? ch.channelType.toLowerCase();
  const meta = CHANNEL_LABELS[ch.channelType] ?? { label: frontId, subtitle: '' };
  return {
    id: frontId,
    label: meta.label,
    subtitle: meta.subtitle,
    published: Number(ch.publishedCount ?? 0),
    masked: Number(ch.maskedCount ?? 0),
    scheduled: Number(ch.scheduledCount ?? 0),
    excluded: 0,
    totalKeywords: 0,
    averageSearchRank: null,
  };
};

const getCatalogueChannels = async (user) => {
  if (env.useMock) return computeChannelMetrics(catalogueEntries);

  try {
    const response = await requestEngineA(user, '/catalog/v1/channels', { allow404: true });
    if (Array.isArray(response?.data)) return response.data.map(mapSalesChannelToMetrics);
  } catch {
    // fall through
  }
  return [];
};

const reindexOpenSearch = async (user) => {
  if (env.useMock) {
    const timestamp = new Date().toISOString();
    catalogueEntries.forEach((entry) => {
      if (entry.status === 'published' || entry.status === 'partial') {
        entry.openSearchIndexed = true;
        entry.openSearchIndexedAt = timestamp;
        entry.channelDetails = entry.channelDetails.map((ch) => ({ ...ch, indexed: ch.id === 'website' }));
      }
    });
    return getOpenSearchStatus(null);
  }

  // Engine A reindex is handled internally; just return current status
  return getOpenSearchStatus(user);
};

const getCatalogueHistory = async (user, id) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    return [...(entry.history ?? [])].sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  }

  // Engine A does not expose a per-product history endpoint; return empty array
  const bundle = await resolvePimBundle(user, id);
  return bundle ? [] : null;
};

const UPDATABLE_FIELDS = new Set(['categoryId', 'categoryPath', 'visibilityRules', 'metrics']);

const updateCatalogueEntry = async (user, id, payload = {}) => {
  if (env.useMock) {
    const entry = catalogueEntries.find((item) => item.id === id);
    if (!entry) return null;
    Object.keys(payload).forEach((key) => { if (UPDATABLE_FIELDS.has(key)) entry[key] = payload[key]; });
    pushHistory(entry, 'Fiche catalogue mise a jour', 'Modifications enregistrees via catalogue', 'draft');
    return enrichEntry(entry);
  }

  // In real mode, read-only fields (nameFr, priceTTC) are PIM-owned.
  // Just refresh and return the current entry.
  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;
  const catalogEntry = await requestEngineA(
    user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}`, { allow404: true },
  );
  return toCatalogueEntry(bundle, catalogEntry?.data);
};

const deleteCatalogueEntry = async (user, id) => {
  if (env.useMock) {
    const index = catalogueEntries.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const [removed] = catalogueEntries.splice(index, 1);
    return removed;
  }

  // Engine A: unpublish serves as the closest operation to "remove from catalogue"
  const bundle = await resolvePimBundle(user, id);
  if (!bundle) return null;

  await requestEngineA(user, `/catalog/v1/products/${encodeURIComponent(bundle.sku)}/unpublish`, {
    method: 'POST',
    body: { skuCode: bundle.sku },
    allow404: true,
  });
  return { id };
};

const getCategories = async (user) => {
  if (env.useMock) return [...categories];

  const response = await requestEngineA(user, '/catalog/v1/categories', { allow404: true });
  return (response?.data ?? []).map(mapCategoryNode);
};

const createCategory = async (user, { nameFr, nameAr, parentId, slug }) => {
  if (env.useMock) {
    const id = `CAT-CAT-${String(categories.length + 1).padStart(3, '0')}`;
    const category = {
      id, nameFr, nameAr: nameAr || '', parentId: parentId || null,
      slug: slug || `/categories/${nameFr.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
    };
    categories.push(category);
    return category;
  }

  const code = slugify(nameFr).slice(0, 30) || `CAT-${Date.now()}`;
  const response = await requestEngineA(user, '/catalog/v1/categories', {
    method: 'POST',
    body: {
      code,
      nameFr,
      nameAr: nameAr || '',
      parentCode: parentId || null,
      metaTitleFr: `${nameFr} | FERZA`.slice(0, 60),
      metaTitleAr: '',
      tvaCategoryCode: code,
      channelConfig: { web: true, whatsapp: true },
      position: 0,
    },
  });
  return mapCategoryNode(response?.data ?? { code, nameFr, nameAr: nameAr || '' });
};

const updateCategory = async (user, id, payload) => {
  if (env.useMock) {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return null;
    if (payload.nameFr !== undefined) category.nameFr = payload.nameFr;
    if (payload.nameAr !== undefined) category.nameAr = payload.nameAr;
    if (payload.parentId !== undefined) category.parentId = payload.parentId;
    if (payload.slug !== undefined) category.slug = payload.slug;
    return category;
  }

  // id is the category code in real mode
  const response = await requestEngineA(user, `/catalog/v1/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: {
      nameFr: payload.nameFr,
      nameAr: payload.nameAr,
      position: 0,
    },
    allow404: true,
  });
  if (!response?.data) return null;
  return mapCategoryNode(response.data);
};

const deleteCategory = async (user, id) => {
  if (env.useMock) {
    const index = categories.findIndex((cat) => cat.id === id);
    if (index === -1) return null;
    const [removed] = categories.splice(index, 1);
    return removed;
  }

  await requestEngineA(user, `/catalog/v1/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    allow404: true,
  });
  return { id };
};

module.exports = {
  computeCatalogueAnalytics,
  computeCatalogueStats,
  computeChannelMetrics,
  createCatalogueEntry,
  createCategory,
  deleteCategory,
  deleteCatalogueEntry,
  getCategories,
  getCatalogue,
  getCatalogueAnalytics,
  getCatalogueChannels,
  getCatalogueHistory,
  getCatalogueItem,
  getCatalogueStats,
  getOpenSearchStatus,
  maskEntry,
  publishEntry,
  reindexOpenSearch,
  scheduleEntry,
  toggleChannelStatus,
  unpublishEntry,
  updateCatalogueEntry,
  updateCategory,
};
