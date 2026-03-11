package com.dz.erp.mdm.sku.domain.event;

import java.time.Instant;

public sealed interface SkuDomainEvent {

    record Registered(String eventId, String eventType, int eventVersion, String tenantId,
                      String aggregateType, String aggregateId, Instant occurredAt,
                      String skuCode, String baseUom, String productType, String createdBy
    ) implements SkuDomainEvent {
    }

    record Activated(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String skuCode, String activatedBy
    ) implements SkuDomainEvent {
    }

    record Updated(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String skuCode, String updatedBy
    ) implements SkuDomainEvent {
    }

    record Discontinued(String eventId, String eventType, int eventVersion, String tenantId,
                        String aggregateType, String aggregateId, Instant occurredAt,
                        String skuCode, String discontinuedBy
    ) implements SkuDomainEvent {
    }
}
