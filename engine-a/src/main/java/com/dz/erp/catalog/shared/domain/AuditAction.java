package com.dz.erp.catalog.shared.domain;

/**
 * Catalogue-specific audit actions logged in catalog_audit_log.
 * Each enum value maps to a state change in the CatalogProduct lifecycle.
 */
public enum AuditAction {
    PUBLISHED,
    UNPUBLISHED,
    MASKED_AUTO,
    REPUBLISHED,
    SCHEDULED,
    SCHEDULE_CANCELLED,
    CHANNEL_CHANGED,
    RULE_TOGGLED,
    EXPORTED,
    CATEGORY_CHANGED,
    DISCONTINUED
}
