package com.dz.erp.inventory.stock.infrastructure.event;

import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Listens to Inventory domain events and creates bell notifications
 * for the relevant roles — same pattern as PimNotificationListener.
 *
 * Lives alongside InventoryEventListener in inventory/stock/infrastructure/event/
 * because all inventory domain events are defined in InventoryDomainEvent (stock subdomain).
 */
@Component
@RequiredArgsConstructor
public class InventoryNotificationListener {

    private final NotificationService notificationService;

    // ── Stock events ──

    @EventListener
    public void on(InventoryDomainEvent.StockZero e) {
        List.of("INVENTORY_MANAGER", "PROCUREMENT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("INVENTORY")
                        .eventType("STOCK_ZERO")
                        .titleKey("notification.inventory.STOCK_ZERO.title")
                        .bodyKey("notification.inventory.STOCK_ZERO.body")
                        .params(Map.of("skuCode", e.skuCode()))
                        .referenceId(e.aggregateId()).referenceType("STOCK_RECORD").build()));
    }

    @EventListener
    public void on(InventoryDomainEvent.StockReplenished e) {
        List.of("INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("INVENTORY")
                        .eventType("STOCK_REPLENISHED")
                        .titleKey("notification.inventory.STOCK_REPLENISHED.title")
                        .bodyKey("notification.inventory.STOCK_REPLENISHED.body")
                        .params(Map.of("skuCode", e.skuCode()))
                        .referenceId(e.aggregateId()).referenceType("STOCK_RECORD").build()));
    }

    @EventListener
    public void on(InventoryDomainEvent.CostUpdated e) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole("SUPER_ADMIN").module("INVENTORY")
                .eventType("COST_UPDATED")
                .titleKey("notification.inventory.COST_UPDATED.title")
                .bodyKey("notification.inventory.COST_UPDATED.body")
                .params(Map.of("skuCode", e.skuCode(),
                        "costFifo", e.costFifo().toPlainString(),
                        "costWeightedAvg", e.costWeightedAvg().toPlainString()))
                .referenceId(e.aggregateId()).referenceType("STOCK_RECORD").build());
    }

    // ── Alert events ──

    @EventListener
    public void on(InventoryDomainEvent.ReorderTriggered e) {
        List.of("INVENTORY_MANAGER", "PROCUREMENT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("INVENTORY")
                        .eventType("BELOW_THRESHOLD")
                        .titleKey("notification.inventory.BELOW_THRESHOLD.title")
                        .bodyKey("notification.inventory.BELOW_THRESHOLD.body")
                        .params(Map.of("skuCode", e.skuCode(),
                                "currentStock", String.valueOf(e.currentStock()),
                                "threshold", String.valueOf(e.threshold()),
                                "suggestedQuantity", String.valueOf(e.suggestedQuantity())))
                        .referenceId(e.aggregateId()).referenceType("STOCK_RECORD").build()));
    }

    // ── Reservation events ──

    @EventListener
    public void on(InventoryDomainEvent.ReservationCreated e) {
        List.of("INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("INVENTORY")
                        .eventType("RESERVATION_CREATED")
                        .titleKey("notification.inventory.RESERVATION_CREATED.title")
                        .bodyKey("notification.inventory.RESERVATION_CREATED.body")
                        .params(Map.of("skuCode", e.skuCode(),
                                "orderId", e.orderId(),
                                "reservationType", e.reservationType(),
                                "quantity", String.valueOf(e.quantity())))
                        .referenceId(e.aggregateId()).referenceType("RESERVATION").build()));
    }

    @EventListener
    public void on(InventoryDomainEvent.ReservationReleased e) {
        List.of("INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("INVENTORY")
                        .eventType("RESERVATION_RELEASED")
                        .titleKey("notification.inventory.RESERVATION_RELEASED.title")
                        .bodyKey("notification.inventory.RESERVATION_RELEASED.body")
                        .params(Map.of("skuCode", e.skuCode(),
                                "orderId", e.orderId(),
                                "reason", e.reason()))
                        .referenceId(e.aggregateId()).referenceType("RESERVATION").build()));
    }
}
