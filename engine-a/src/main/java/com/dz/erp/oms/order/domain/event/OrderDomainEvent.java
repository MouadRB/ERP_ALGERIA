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
 *
 * <p>Customer-contact fields ({@code customerPhone, customerName, wilayaCode}) are
 * carried on every event consumed by engine-b's {@code OmsOrderEventHandler} so that
 * the CRM upsert (lookup-by-phone → create-if-missing) has the data it needs.
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
                         BigDecimal grandTotalTtc,
                         String customerPhone, String customerName, Integer wilaya)
            implements OrderDomainEvent {
    }

    record OrderValidated(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String channelCode) implements OrderDomainEvent {
    }

    record OrderRejected(String eventId, String eventType, int eventVersion, String tenantId,
                         String aggregateType, String aggregateId, Instant occurredAt,
                         String reasonCode, String reasonMessage,
                         String customerPhone, String customerName, Integer wilaya,
                         String externalOrderRef) implements OrderDomainEvent {
    }

    /**
     * Status-transition event. Engine-b matches on {@code eventType} (e.g.
     * {@code OMS_ORDER_COMPLETED}, {@code OMS_SHIPMENT_DELIVERED}); the customer-contact
     * + total fields below let the CRM/Finance handlers run without needing a separate
     * event record per transition.
     */
    record OrderStatusChanged(String eventId, String eventType, int eventVersion, String tenantId,
                              String aggregateType, String aggregateId, Instant occurredAt,
                              OrderStatus fromStatus, OrderStatus toStatus,
                              String transitionEvent,
                              String customerPhone, String customerName, Integer wilaya,
                              String externalOrderRef, BigDecimal grandTotalTtc)
            implements OrderDomainEvent {
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
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String customerPhone, String customerName, Integer wilaya,
                          String externalOrderRef) implements OrderDomainEvent {
    }

    record OrderCancelled(String eventId, String eventType, int eventVersion, String tenantId,
                          String aggregateType, String aggregateId, Instant occurredAt,
                          String reasonCode, String reasonMessage,
                          String customerPhone, String customerName, Integer wilaya,
                          String externalOrderRef) implements OrderDomainEvent {
    }
}
