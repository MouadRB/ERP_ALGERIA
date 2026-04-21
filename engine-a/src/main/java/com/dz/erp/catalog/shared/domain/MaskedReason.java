package com.dz.erp.catalog.shared.domain;

/**
 * Why a product was masked. Stored on CatalogProduct.maskedReason.
 * AUTO reasons are set by the system (event-driven).
 * MANUAL is set by a manager (human decision).
 */
public enum MaskedReason {
    AUTO_STOCK_ZERO,
    MANUAL,
    DISCONTINUED,
    PRICE_ZERO,
    OCR_DRAFT,
    NEGATIVE_STOCK,
    AUTO_UNPUBLISH_EXPIRED
}
