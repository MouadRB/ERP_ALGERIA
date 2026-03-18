const transformCatalogueEntry = (raw) => ({
  id: raw.entryId ?? raw.id,
  productId: raw.productId,
  sku: raw.sku,
  nameFr: raw.nameFr ?? raw.name,
  nameAr: raw.nameAr ?? '',
  priceTTC: raw.priceTTC,
  status: raw.status ?? 'draft',
  publishedAt: raw.publishedAt ?? null,
  channels: raw.channels ?? [],
  openSearchIndexed: raw.openSearchIndexed ?? false,
  openSearchIndexedAt: raw.openSearchIndexedAt ?? null,
  scheduledUnpublishAt: raw.scheduledUnpublishAt ?? null,
  visibilityRules: raw.visibilityRules ?? { minStock: 1, showOutOfStock: false },
});

const transformCatalogueList = (rawList) => rawList.map(transformCatalogueEntry);

module.exports = { transformCatalogueEntry, transformCatalogueList };