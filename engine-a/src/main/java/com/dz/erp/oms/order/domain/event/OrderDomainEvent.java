package com.dz.erp.oms.order.domain.event;

import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Sealed hierarchy of domain events emitted by the {@link com.dz.erp.oms.order.domain.model.Order}
 * aggregate. Shape matches {@code pim.product.domain.event.ProductDomainEvent}:
 * every record starts with the 7 envelope fields
 * ({@code eventId, eventType, eventVersion, tenantId, aggregateType, aggregateId, occurredAt})
 * followed by business-specific fields.
 */
public sealed interface OrderDomainEvent {

    String eventId();
    String eventType();
    String aggregateId();
    String tenantId();
    Instant occurredAt();

    record OrderReceived(String eventId, String eventType, int eventVersion, String tenantId,
                         String aggregateType, String aggregateId, Instant occurredAt,
                         String channelCode, String externalOrderRef, String customerId,
                         PaymentMethod paymentMethod, String currency,
                         BigDecimal grandTotalTtc) implements OrderDomainEvent {
    }

    record OrderValidated(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String channelCode) implements OrderDomainEvent {
    }

    record OrderRejected(String eventId, String eventType, int eventVersion, String tenantId,
                         String aggregateType, String aggregateId, Instant occurredAt,
                         String reasonCode, String reasonMessage) implements OrderDomainEvent {
    }

    record OrderStatusChanged(String eventId, String eventType, int eventVersion, String tenantId,
                              String aggregateType, String aggregateId, Instant occurredAt,
                              OrderStatus fromStatus, OrderStatus toStatus,
                              String transitionEvent) implements OrderDomainEvent {
    }

    record OrderReserved(String eventId, String eventType, int eventVersion, String tenantId,
                         String aggregateType, String aggregateId, Instant occurredAt)
            implements OrderDomainEvent {
    }

    record OrderAwaitingStock(String eventId, String eventType, int eventVersion, String tenantId,
                              String aggregateType, String aggregateId, Instant occurredAt,
                              String reasonCode, String reasonMessage) implements OrderDomainEvent {
    }

    record OrderConfirmed(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt)
            implements OrderDomainEvent {
    }

    record OrderCancelled(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String reasonCode, String reasonMessage) implements OrderDomainEvent {
    }
}
