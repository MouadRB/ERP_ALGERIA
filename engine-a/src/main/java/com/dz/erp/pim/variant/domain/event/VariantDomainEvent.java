package com.dz.erp.pim.variant.domain.event;

import java.time.Instant;

public sealed interface VariantDomainEvent {
    record Created(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType,
                   String aggregateId, Instant occurredAt, String variantId, String skuCode,
                   String createdBy) implements VariantDomainEvent {
    }

    record Updated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType,
                   String aggregateId, Instant occurredAt, String variantId,
                   String updatedBy) implements VariantDomainEvent {
    }

    record StockUpdated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType,
                        String aggregateId, Instant occurredAt, String variantId, String skuCode,
                        int newQuantity) implements VariantDomainEvent {
    }
}
