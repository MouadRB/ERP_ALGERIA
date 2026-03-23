package com.dz.erp.pim.product.domain.event;

import java.math.BigDecimal;
import java.time.Instant;

public sealed interface ProductDomainEvent {

    record Created(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String skuCode, String nameFr, String categoryCode,
                   String createdBy) implements ProductDomainEvent {
    }

    record Activated(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String skuCode, String nameFr, String activatedBy) implements ProductDomainEvent {
    }

    record ActivatedFromOcr(String eventId, String eventType, int eventVersion, String tenantId,
                            String aggregateType, String aggregateId, Instant occurredAt,
                            String productId, String skuCode, String nameFr,
                            String activatedBy) implements ProductDomainEvent {
    }


    record Deactivated(String eventId, String eventType, int eventVersion, String tenantId,
                       String aggregateType, String aggregateId, Instant occurredAt,
                       String skuCode, String nameFr, String deactivatedBy) implements ProductDomainEvent {
    }

    record Discontinued(String eventId, String eventType, int eventVersion, String tenantId,
                        String aggregateType, String aggregateId, Instant occurredAt,
                        String skuCode, String nameFr, String discontinuedBy) implements ProductDomainEvent {
    }

    record Updated(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String productId, String updatedBy) implements ProductDomainEvent {
    }

    record Flagged(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String skuCode, String nameFr, BigDecimal returnRate) implements ProductDomainEvent {
    }

    record PriceModified(String eventId, String eventType, int eventVersion, String tenantId,
                         String aggregateType, String aggregateId, Instant occurredAt,
                         String nameFr, BigDecimal oldPrice, BigDecimal newPrice,
                         String changedBy) implements ProductDomainEvent {
    }
}
