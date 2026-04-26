package com.dz.erp.inventory.stock.domain.event;

import java.math.BigDecimal;
import java.time.Instant;

public sealed interface InventoryDomainEvent {

    record StockUpdated(String eventId, String eventType, int eventVersion, String tenantId,
                        String aggregateType, String aggregateId, Instant occurredAt,
                        String skuCode, String variantId,
                        int newTotalQuantity, int available) implements InventoryDomainEvent {
    }

    record StockZero(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String skuCode) implements InventoryDomainEvent {
    }

    record StockReplenished(String eventId, String eventType, int eventVersion, String tenantId,
                            String aggregateType, String aggregateId, Instant occurredAt,
                            String skuCode) implements InventoryDomainEvent {
    }

    record CostUpdated(String eventId, String eventType, int eventVersion, String tenantId,
                       String aggregateType, String aggregateId, Instant occurredAt,
                       String skuCode, BigDecimal costFifo, BigDecimal costWeightedAvg,
                       String purchaseOrderRef) implements InventoryDomainEvent {
    }

    record ReorderTriggered(String eventId, String eventType, int eventVersion, String tenantId,
                            String aggregateType, String aggregateId, Instant occurredAt,
                            String skuCode, String supplierCode, int suggestedQuantity,
                            int currentStock, int threshold) implements InventoryDomainEvent {
    }

    record ReservationCreated(String eventId, String eventType, int eventVersion, String tenantId,
                              String aggregateType, String aggregateId, Instant occurredAt,
                              String orderId, String skuCode, String reservationType,
                              int quantity) implements InventoryDomainEvent {
    }

    record ReservationReleased(String eventId, String eventType, int eventVersion, String tenantId,
                               String aggregateType, String aggregateId, Instant occurredAt,
                               String orderId, String skuCode, String reason) implements InventoryDomainEvent {
    }

    record ReservationExpired(String eventId, String eventType, int eventVersion, String tenantId,
                              String aggregateType, String aggregateId, Instant occurredAt,
                              String orderId, String skuCode, int quantity) implements InventoryDomainEvent {
    }
}
