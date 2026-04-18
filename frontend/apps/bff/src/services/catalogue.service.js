const env = require('../config/env');
const { catalogueEntries, categories } = require('../mocks/catalogue.mock');
const { products } = require('../mocks/pim.mock');
const inventoryService = require('./inventory.service');
const { enrichCatalogueEntryWithPIM } = require('./cross-module.helpers');

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
  return {
    data: rows.slice(start, start + pageSize),
    meta: { total, page, pageSize },
  };
};

const getProduct = (entry) =>
  products.find((product) => product.id === entry.productId || product.sku === entry.sku) ?? null;

// Inventory is the single source of truth — we delegate stock lookup to
// inventory.service rather than reading the raw mock here.
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
    .filter((channel) => channel.status !== 'draft')
    .map((channel) => channel.id);
};

const syncStatusFromChannels = (entry) => {
  const activeCount = entry.channelDetails.filter((channel) => channel.status === 'published').length;
  const scheduledCount = entry.channelDetails.filter((channel) => channel.status === 'scheduled').length;

  if (activeCount === 0 && scheduledCount === 0) {
    entry.status = 'draft';
  } else if (activeCount > 0 && activeCount < entry.channelDetails.length) {
    entry.status = 'partial';
  } else if (activeCount === entry.channelDetails.length && activeCount > 0) {
    entry.status = 'published';
  } else if (scheduledCount > 0) {
    entry.status = 'scheduled';
  }

  entry.openSearchIndexed = entry.channelDetails.some(
    (channel) => channel.id === 'website' && channel.indexed,
  );
  if (entry.openSearchIndexed) {
    entry.openSearchIndexedAt = new Date().toISOString();
  }
  syncChannels(entry);
};

const enrichEntry = (entry) => {
  // SYNC-9: inject PIM-owned fields (nameFr, nameAr, priceTTC)
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

const applyFilters = (rows, filters = {}) => {
  const { category, channel, maxPrice, minPrice, search, status, stockStatus } = filters;

  return rows.filter((entry) => {
    if (status && entry.status !== status) return false;
    if (category && entry.categoryId !== category) return false;
    if (channel && !entry.channels.includes(channel)) return false;
    if (stockStatus && entry.stockStatus !== stockStatus) return false;
    if (typeof minPrice === 'number' && entry.priceTTC < minPrice) return false;
    if (typeof maxPrice === 'number' && entry.priceTTC > maxPrice) return false;

    if (search) {
      const query = String(search).toLowerCase();
      const matches = [entry.nameFr, entry.nameAr, entry.sku, entry.categoryId, entry.categoryPath]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      if (!matches) return false;
    }

    return true;
  });
};

const getSortValue = (entry, sortBy) => {
  switch (sortBy) {
    case 'nameFr':
      return entry.nameFr;
    case 'sku':
      return entry.sku;
    case 'categoryId':
      return entry.categoryId;
    case 'priceTTC':
      return entry.priceTTC;
    case 'availableStock':
      return entry.availableStock;
    case 'status':
      return entry.status;
    case 'publishedAt':
      return entry.publishedAt ?? '';
    case 'updatedAt':
    default:
      return entry.history?.[0]?.at ?? entry.openSearchIndexedAt ?? entry.publishedAt ?? '';
  }
};

const sortRows = (rows, sortBy = 'updatedAt', sortOrder = 'desc') => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = getSortValue(left, sortBy);
    const rightValue = getSortValue(right, sortBy);

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue), 'fr', {
      numeric: true,
      sensitivity: 'base',
    }) * direction;
  });
};

const getCatalogue = async ({
  page = 1,
  pageSize = 20,
  search,
  status,
  category,
  stockStatus,
  channel,
  minPrice,
  maxPrice,
  sortBy = 'updatedAt',
  sortOrder = 'desc',
} = {}) => {
  if (!env.useMock) {
    return paginate([], page, pageSize);
  }

  const rows = sortRows(
    applyFilters(catalogueEntries.map(enrichEntry), {
      category,
      channel,
      maxPrice,
      minPrice,
      search,
      status,
      stockStatus,
    }),
    sortBy,
    sortOrder,
  );

  return paginate(rows, page, pageSize);
};

const getCatalogueItem = async (id) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  const enriched = enrichEntry(entry);
  const relatedProducts = catalogueEntries
    .filter((item) => item.categoryId === entry.categoryId && item.id !== entry.id)
    .slice(0, 4)
    .map((item) => {
      const related = enrichCatalogueEntryWithPIM(item);
      return {
        id: related.id,
        sku: related.sku,
        nameFr: related.nameFr,
        priceTTC: related.priceTTC,
        status: related.status,
      };
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
};

const createCatalogueEntry = async (payload) => {
  const sourceProduct =
    products.find((product) => product.id === payload.productId || product.sku === payload.sku) ?? null;

  // SYNC-9: nameFr, nameAr, priceTTC are PIM-owned — not stored on catalogue entries.
  // They will be injected at enrichment time via enrichCatalogueEntryWithPIM.
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
    visibilityRules: {
      minStock: 1,
      showOutOfStock: false,
      autoMaskOnZeroStock: true,
      allowedWilayasCount: 48,
      hiddenWilayas: [],
    },
    metrics: {
      views7d: 0,
      addToCartRate: 0,
      conversionRate: 0,
      topSearchTerm: '',
      returnRate: sourceProduct?.returnRate ?? 0,
    },
    history: [
      {
        id: `HIST-CAT-${Date.now()}`,
        type: 'draft',
        title: 'Entree catalogue creee',
        subtitle: 'En attente publication',
        actor: 'Catalogue Manager',
        at: new Date().toISOString(),
      },
    ],
  };

  catalogueEntries.unshift(entry);
  return enrichEntry(entry);
};

const publishEntry = async (id) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  entry.status = 'published';
  entry.publishedAt = new Date().toISOString();
  entry.openSearchIndexed = true;
  entry.openSearchIndexedAt = entry.publishedAt;
  entry.channelDetails =
    entry.channelDetails.length > 0
      ? entry.channelDetails.map((channel) => ({
          ...channel,
          indexed: channel.id === 'website',
          status: 'published',
        }))
      : [{ ...DEFAULT_CHANNELS.website, status: 'published' }];
  syncChannels(entry);
  pushHistory(entry, 'Produit publie', 'Activation multi-canal terminee', 'publish');
  return enrichEntry(entry);
};

const maskEntry = async (id) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  entry.status = 'masked';
  entry.openSearchIndexed = false;
  entry.openSearchIndexedAt = null;
  entry.channelDetails =
    entry.channelDetails.length > 0
      ? entry.channelDetails.map((channel) => ({
          ...channel,
          indexed: false,
          status: 'masked',
        }))
      : [{ ...DEFAULT_CHANNELS.website, indexed: false, status: 'masked' }];
  syncChannels(entry);
  pushHistory(entry, 'Produit masque', 'Masquage manuel applique via catalogue', 'mask');
  return enrichEntry(entry);
};

const unpublishEntry = async (id) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  entry.status = 'draft';
  entry.channels = [];
  entry.channelDetails = entry.channelDetails.map((channel) => ({
    ...channel,
    indexed: false,
    status: 'draft',
  }));
  entry.openSearchIndexed = false;
  pushHistory(entry, 'Produit de-publie', 'Retrait manuel des canaux', 'unpublish');
  return enrichEntry(entry);
};

const scheduleEntry = async (id, scheduledAt, type = 'publish') => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  if (type === 'unpublish') {
    entry.scheduledUnpublishAt = scheduledAt;
    pushHistory(entry, 'Depublication auto planifiee', `Retrait prevu le ${scheduledAt}`, 'schedule');
    return enrichEntry(entry);
  }

  entry.status = 'scheduled';
  entry.scheduledPublishAt = scheduledAt;
  entry.channelDetails =
    entry.channelDetails.length > 0
      ? entry.channelDetails.map((channel) => ({ ...channel, status: 'scheduled' }))
      : [{ ...DEFAULT_CHANNELS.website, indexed: false, status: 'scheduled' }];
  syncChannels(entry);
  pushHistory(entry, 'Publication planifiee', `Diffusion prevue le ${scheduledAt}`, 'schedule');
  return enrichEntry(entry);
};

const toggleChannelStatus = async (id, channelId, enabled) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  const existingChannel = entry.channelDetails.find((channel) => channel.id === channelId);
  const template = DEFAULT_CHANNELS[channelId] ?? {
    activeKeywords: 1,
    featuredPlacement: 'Canal additionnel',
    id: channelId,
    indexed: false,
    label: channelId,
    searchRank: null,
    subtitle: 'catalogue-ferza',
  };

  if (existingChannel) {
    existingChannel.status = enabled ? 'published' : 'draft';
    existingChannel.indexed = enabled && channelId === 'website';
  } else {
    entry.channelDetails.push({
      ...template,
      status: enabled ? 'published' : 'draft',
    });
  }

  syncStatusFromChannels(entry);
  pushHistory(
    entry,
    enabled ? 'Canal active' : 'Canal suspendu',
    `${template.label} ${enabled ? 'publie' : 'retire'} via mode mock`,
    enabled ? 'publish' : 'unpublish',
  );
  return enrichEntry(entry);
};

const getOpenSearchStatus = async () => {
  const indexedEntries = catalogueEntries.filter((entry) => entry.openSearchIndexed);
  const publishedEntries = catalogueEntries.filter((entry) => entry.status === 'published');

  return {
    totalIndexed: indexedEntries.length,
    totalPublished: publishedEntries.length,
    lastIndexedAt: indexedEntries
      .map((entry) => entry.openSearchIndexedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    health: indexedEntries.length >= Math.max(1, publishedEntries.length - 1) ? 'green' : 'yellow',
  };
};

// Pure KPI computation over the real catalogue entries. Consumed by
// CatalogueStatsBar. Zero fabricated values — every number maps to a
// deterministic fold over the mock array.
const isPendingPublication = (entry) => {
  if (entry.status === 'scheduled' && entry.scheduledPublishAt) {
    return new Date(entry.scheduledPublishAt).getTime() > Date.now();
  }
  return entry.status === 'draft' || entry.status === 'en_attente';
};

const computeCatalogueStats = (items) => {
  const enriched = items.map(enrichEntry);
  const total = enriched.length;
  const published = enriched.filter((entry) => entry.status === 'published').length;
  const masked = enriched.filter((entry) => entry.status === 'masked').length;
  const scheduled = enriched.filter((entry) => entry.status === 'scheduled').length;
  const draft = enriched.filter((entry) => entry.status === 'draft').length;
  const partial = enriched.filter((entry) => entry.status === 'partial').length;
  const pendingPublication = enriched.filter(isPendingPublication).length;
  const rupture = enriched.filter((entry) => entry.stockStatus === 'rupture').length;
  const lowStock = enriched.filter((entry) => entry.stockStatus === 'faible').length;
  const indexed = enriched.filter((entry) => entry.openSearchIndexed).length;
  const totalValue = enriched.reduce(
    (sum, entry) => sum + Number(entry.priceTTC || 0) * (entry.inventory?.quantityOnHand ?? 0),
    0,
  );

  return {
    total,
    published,
    masked,
    scheduled,
    draft,
    partial,
    pendingPublication,
    rupture,
    lowStock,
    indexed,
    totalValue,
  };
};

// Pure analytics computation — every figure derives from the real array.
const computeCatalogueAnalytics = (items) => {
  const enriched = items.map(enrichEntry);
  const totalViews = enriched.reduce((sum, entry) => sum + Number(entry.metrics?.views7d || 0), 0);

  const avg = (key) => {
    if (!enriched.length) return 0;
    const sum = enriched.reduce((total, entry) => total + Number(entry.metrics?.[key] || 0), 0);
    return sum / enriched.length;
  };

  const topByViews = [...enriched]
    .sort((left, right) => Number(right.metrics?.views7d || 0) - Number(left.metrics?.views7d || 0))
    .slice(0, 5)
    .map((entry) => ({
      id: entry.id,
      sku: entry.sku,
      nameFr: entry.nameFr,
      categoryId: entry.categoryId,
      views7d: Number(entry.metrics?.views7d || 0),
      conversionRate: Number(entry.metrics?.conversionRate || 0),
      status: entry.status,
    }));

  const categoryMap = new Map();
  enriched.forEach((entry) => {
    const bucket = categoryMap.get(entry.categoryId) ?? {
      categoryId: entry.categoryId,
      total: 0,
      published: 0,
      views7d: 0,
    };
    bucket.total += 1;
    if (entry.status === 'published') bucket.published += 1;
    bucket.views7d += Number(entry.metrics?.views7d || 0);
    categoryMap.set(entry.categoryId, bucket);
  });

  return {
    totals: {
      entries: enriched.length,
      published: enriched.filter((entry) => entry.status === 'published').length,
      masked: enriched.filter((entry) => entry.status === 'masked').length,
      scheduled: enriched.filter((entry) => entry.status === 'scheduled').length,
      draft: enriched.filter((entry) => entry.status === 'draft').length,
      views7d: totalViews,
    },
    averages: {
      addToCartRate: Number(avg('addToCartRate').toFixed(4)),
      conversionRate: Number(avg('conversionRate').toFixed(4)),
      returnRate: Number(avg('returnRate').toFixed(4)),
    },
    topProducts: topByViews,
    byCategory: Array.from(categoryMap.values()).sort((left, right) => right.total - left.total),
  };
};

// Per-channel rollup for the "Canaux de ventes" dashboard.
// publiés  = entry has this channel AND its channelDetails.status === 'published'
// masquées = entry has this channel AND its channelDetails.status === 'masked'
// planifié = entry has this channel AND its channelDetails.status === 'scheduled'
// exclus   = entry does NOT have this channel in its channels[] array
const computeChannelMetrics = (items) => {
  const knownChannels = new Map();
  items.forEach((entry) => {
    entry.channelDetails.forEach((channel) => {
      if (!knownChannels.has(channel.id)) {
        knownChannels.set(channel.id, {
          id: channel.id,
          label: channel.label,
          subtitle: channel.subtitle,
        });
      }
    });
  });

  return Array.from(knownChannels.values()).map((channel) => {
    let published = 0;
    let masked = 0;
    let scheduled = 0;
    let excluded = 0;
    let totalKeywords = 0;
    let totalSearchRank = 0;
    let rankCount = 0;

    items.forEach((entry) => {
      const detail = entry.channelDetails.find((current) => current.id === channel.id);
      if (!detail) {
        excluded += 1;
        return;
      }
      if (detail.status === 'published') published += 1;
      else if (detail.status === 'masked') masked += 1;
      else if (detail.status === 'scheduled') scheduled += 1;
      else excluded += 1;

      totalKeywords += Number(detail.activeKeywords || 0);
      if (typeof detail.searchRank === 'number') {
        totalSearchRank += detail.searchRank;
        rankCount += 1;
      }
    });

    return {
      id: channel.id,
      label: channel.label,
      subtitle: channel.subtitle,
      published,
      masked,
      scheduled,
      excluded,
      totalKeywords,
      averageSearchRank: rankCount ? Number((totalSearchRank / rankCount).toFixed(1)) : null,
    };
  });
};

const deleteCatalogueEntry = async (id) => {
  const index = catalogueEntries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;
  const [removed] = catalogueEntries.splice(index, 1);
  return removed;
};

// SYNC-9: nameFr, nameAr, priceTTC are PIM-owned — not updatable via catalogue.
const UPDATABLE_FIELDS = new Set([
  'categoryId',
  'categoryPath',
  'visibilityRules',
  'metrics',
]);

const updateCatalogueEntry = async (id, payload = {}) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;

  Object.keys(payload).forEach((key) => {
    if (UPDATABLE_FIELDS.has(key)) {
      entry[key] = payload[key];
    }
  });

  pushHistory(
    entry,
    'Fiche catalogue mise a jour',
    'Modifications enregistrees via catalogue',
    'draft',
  );
  return enrichEntry(entry);
};

const getCatalogueHistory = async (id) => {
  const entry = catalogueEntries.find((item) => item.id === id);
  if (!entry) return null;
  return [...(entry.history ?? [])].sort((left, right) =>
    String(right.at || '').localeCompare(String(left.at || '')),
  );
};

const getCatalogueStats = async () => {
  if (!env.useMock) return computeCatalogueStats([]);
  return computeCatalogueStats(catalogueEntries);
};

const getCatalogueAnalytics = async () => {
  if (!env.useMock) return computeCatalogueAnalytics([]);
  return computeCatalogueAnalytics(catalogueEntries);
};

const getCatalogueChannels = async () => {
  if (!env.useMock) return [];
  return computeChannelMetrics(catalogueEntries);
};

const reindexOpenSearch = async () => {
  const timestamp = new Date().toISOString();

  catalogueEntries.forEach((entry) => {
    if (entry.status === 'published' || entry.status === 'partial') {
      entry.openSearchIndexed = true;
      entry.openSearchIndexedAt = timestamp;
      entry.channelDetails = entry.channelDetails.map((channel) => ({
        ...channel,
        indexed: channel.id === 'website',
      }));
    }
  });

  return getOpenSearchStatus();
};

const getCategories = async () => {
  return [...categories];
};

const createCategory = async ({ nameFr, nameAr, parentId, slug }) => {
  const id = `CAT-CAT-${String(categories.length + 1).padStart(3, '0')}`;
  const category = {
    id,
    nameFr,
    nameAr: nameAr || '',
    parentId: parentId || null,
    slug: slug || `/categories/${nameFr.toLowerCase().replace(/\s+/g, '-')}`,
    createdAt: new Date().toISOString(),
  };
  categories.push(category);
  return category;
};

const updateCategory = async (id, payload) => {
  const category = categories.find((cat) => cat.id === id);
  if (!category) return null;
  if (payload.nameFr !== undefined) category.nameFr = payload.nameFr;
  if (payload.nameAr !== undefined) category.nameAr = payload.nameAr;
  if (payload.parentId !== undefined) category.parentId = payload.parentId;
  if (payload.slug !== undefined) category.slug = payload.slug;
  return category;
};

const deleteCategory = async (id) => {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index === -1) return null;
  const [removed] = categories.splice(index, 1);
  return removed;
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
