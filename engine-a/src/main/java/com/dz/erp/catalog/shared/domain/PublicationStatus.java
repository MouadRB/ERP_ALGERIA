package com.dz.erp.catalog.shared.domain;

/**
 * Publication lifecycle states for a CatalogProduct.
 * Transitions enforced by the domain — invalid transitions throw BusinessException.
 *
 * DRAFT           → product assigned to category but not yet published
 * PUBLISHED       → visible on all enabled channels
 * MASKED_AUTO     → hidden by system rule (stock=0, discontinued, price=0, OCR draft)
 * MASKED_MANUAL   → hidden by manager choice
 * SCHEDULED       → publication planned for a future date
 * DISCONTINUED    → terminal — PIM ProductDiscontinued event received
 */
public enum PublicationStatus {
    DRAFT,
    PUBLISHED,
    MASKED_AUTO,
    MASKED_MANUAL,
    SCHEDULED,
    DISCONTINUED
}
