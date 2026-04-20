package com.dz.erp.oms.returns.domain.event;

import java.time.Instant;

/**
 * Sealed hierarchy of return domain events. Shape matches
 * {@code pim.product.domain.event.ProductDomainEvent}: 7 envelope fields
 * ({@code eventId, eventType, eventVersion, tenantId, aggregateType, aggregateId, occurredAt})
 * followed by business-specific fields.
 */
public sealed interface ReturnDomainEvent {

    String eventId();
    String eventType();
    String aggregateId();
    String tenantId();
    Instant occurredAt();

    record ReturnRequested(String eventId, String eventType, int eventVersion, String tenantId,
                           String aggregateType, String aggregateId, Instant occurredAt,
                           String orderId, int lineCount, String reasonCode)
            implements ReturnDomainEvent {
    }

    record ReturnPickupArranged(String eventId, String eventType, int eventVersion, String tenantId,
                                String aggregateType, String aggregateId, Instant occurredAt,
                                String orderId, String carrierCode) implements ReturnDomainEvent {
    }

    record ReturnClosed(String eventId, String eventType, int eventVersion, String tenantId,
                        String aggregateType, String aggregateId, Instant occurredAt,
                        String orderId, boolean approved) implements ReturnDomainEvent {
    }
}
