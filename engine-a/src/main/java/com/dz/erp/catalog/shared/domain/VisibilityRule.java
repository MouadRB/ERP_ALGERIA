package com.dz.erp.catalog.shared.domain;

/**
 * Named visibility rules that control product publication.
 * Rules can be globally configured per SalesChannel or overridden per CatalogProduct.
 * Evaluated in priority order — first failing hard rule determines outcome.
 */
public enum VisibilityRule {
    MASK_IF_STOCK_ZERO,
    REPUBLISH_IF_STOCK_POSITIVE,
    MASK_IF_DISCONTINUED,
    MASK_IF_PRICE_ZERO,
    MASK_IF_OCR_DRAFT,
    EXCLUDE_VARIANT_IF_STOCK_ZERO,
    BADGE_STOCK_LIMIT,
    HOMEPAGE_FEATURED,
    WHATSAPP_PRICE_CAP,
    EXCLUDE_NEGATIVE_STOCK
}
