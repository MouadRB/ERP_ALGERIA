package com.dz.erp.oms.integration.domain.event;

import java.time.Instant;

/**
 * Sealed hierarchy of events emitted by the {@code CarrierShipment} aggregate.
 * Shape matches {@code pim.product.domain.event.ProductDomainEvent}: 7 envelope
 * fields followed by business-specific fields.
 */
public sealed interface ShipmentDomainEvent {

    String eventId();
    String eventType();
    String aggregateId();
    String tenantId();
    Instant occurredAt();

    record ShipmentSubmitted(String eventId, String eventType, int eventVersion, String tenantId,
                             String aggregateType, String aggregateId, Instant occurredAt,
                             String orderId, String carrierCode, String trackingNumber)
            implements ShipmentDomainEvent {
    }

    record ShipmentPickedUp(String eventId, String eventType, int eventVersion, String tenantId,
                            String aggregateType, String aggregateId, Instant occurredAt,
                            String orderId, String carrierCode) implements ShipmentDomainEvent {
    }

    record ShipmentInTransit(String eventId, String eventType, int eventVersion, String tenantId,
                             String aggregateType, String aggregateId, Instant occurredAt,
                             String orderId, String carrierCode) implements ShipmentDomainEvent {
    }

    record ShipmentDelivered(String eventId, String eventType, int eventVersion, String tenantId,
                             String aggregateType, String aggregateId, Instant occurredAt,
                             String orderId, String carrierCode) implements ShipmentDomainEvent {
    }

    record ShipmentFailed(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String orderId, String carrierCode,
                          String reasonCode, String reasonMessage)
            implements ShipmentDomainEvent {
    }
}
