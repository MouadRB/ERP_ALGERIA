package com.dz.erp.oms.returns.domain.event;

import java.time.Instant;

/**
 * Sealed hierarchy of return domain events. Shape matches
 * {@code pim.product.domain.event.ProductDomainEvent}: 7 envelope fields
 * ({@code eventId, eventType, eventVersion, tenantId, aggregateType, aggregateId, occurredAt})
 * followed by business-specific fields.
 *
 * <p>{@code customerPhone} + {@code externalOrderRef} are populated by
 * {@code ReturnRequestService} from the related Order so engine-b's
 * {@code OmsReturnEventHandler} can open / close the matching CRM ticket.
 */
public sealed interface ReturnDomainEvent {

    String eventId();
    String eventType();
    String aggregateId();
    String tenantId();
    Instant occurredAt();

    record ReturnRequested(String eventId, String eventType, int eventVersion, String tenantId,
                           String aggregateType, String aggregateId, Instant occurredAt,
                           String orderId, int lineCount, String reasonCode,
                           String reason, String customerPhone, String externalOrderRef)
            implements ReturnDomainEvent {
    }

    record ReturnPickupArranged(String eventId, String eventType, int eventVersion, String tenantId,
                                String aggregateType, String aggregateId, Instant occurredAt,
                                String orderId, String carrierCode) implements ReturnDomainEvent {
    }

    record ReturnClosed(String eventId, String eventType, int eventVersion, String tenantId,
                        String aggregateType, String aggregateId, Instant occurredAt,
                        String orderId, boolean approved,
                        String customerPhone, String externalOrderRef)
            implements ReturnDomainEvent {
    }
}
