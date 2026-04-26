package com.dz.erp.catalog.category.domain.event;

/**
 * Sealed interface for Category domain events.
 * Events collected by the aggregate, drained and published by the service.
 */
public sealed interface CatalogCategoryDomainEvent {

    record Created(String categoryId, String code, String tenantId,
                   String createdBy) implements CatalogCategoryDomainEvent {
    }

    record Updated(String categoryId, String code, String tenantId,
                   boolean slugChanged) implements CatalogCategoryDomainEvent {
    }

    record Deleted(String categoryId, String code,
                   String tenantId) implements CatalogCategoryDomainEvent {
    }
}
