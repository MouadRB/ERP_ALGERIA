package com.dz.erp.catalog.shared.domain;

/**
 * Domain port for publishing catalog events.
 * Same pattern as PIM's ProductEventPort.
 * Infrastructure adapter fires ApplicationEvent (intra-engine) + writes outbox row (cross-engine).
 */
public interface CatalogEventPort {

    /**
     * @param eventType    e.g. "PRODUCT_PUBLISHED", "PRODUCT_MASKED_AUTO"
     * @param aggregateId  the catalog product ID or category ID
     * @param eventPayload the domain event record (will be serialized to JSON for outbox)
     */
    void publish(String eventType, String aggregateId, Object eventPayload);
}
