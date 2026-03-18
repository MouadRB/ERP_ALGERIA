const transformProduct = (raw) => ({
  id: raw.productId ?? raw.id,
  sku: raw.sku,
  nameFr: raw.nameFr ?? raw.name,
  nameAr: raw.nameAr ?? '',
  descriptionFr: raw.descriptionFr ?? '',
  descriptionAr: raw.descriptionAr ?? '',
  categoryId: raw.categoryId,
  brandId: raw.brandId,
  priceHT: raw.priceHT,
  tvaRate: raw.tvaRate ?? 'standard',
  priceTTC: raw.priceTTC,
  status: raw.status ?? 'draft',
  variants: (raw.variants ?? []).map((v) => ({
    variantId: v.variantId ?? v.id,
    sku: v.sku,
    attributes: v.attributes ?? {},
    priceTTC: v.priceTTC,
    stock: v.stock ?? 0,
  })),
  mediaUrls: raw.mediaUrls ?? raw.images ?? [],
  weightKg: raw.weightKg ?? null,
  dimensions: raw.dimensions ?? null,
  createdBy: raw.createdBy,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const transformProductList = (rawList) => rawList.map(transformProduct);

module.exports = { transformProduct, transformProductList };