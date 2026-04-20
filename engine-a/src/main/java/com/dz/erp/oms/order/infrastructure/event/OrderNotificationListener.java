package com.dz.erp.oms.order.infrastructure.event;

import com.dz.erp.oms.order.domain.event.OrderDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Creates bell notifications for OMS order events — same pattern as
 * {@code InventoryNotificationListener}. Stage 2 wires the
 * {@code ORDER_AWAITING_STOCK} path for sales managers; further stages extend this.
 */
@Component
@RequiredArgsConstructor
public class OrderNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void on(OrderDomainEvent.OrderAwaitingStock e) {
        List.of("SALES_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("OMS")
                        .eventType("ORDER_OUT_OF_STOCK")
                        .titleKey("notification.oms.ORDER_OUT_OF_STOCK.title")
                        .bodyKey("notification.oms.ORDER_OUT_OF_STOCK.body")
                        .params(Map.of(
                                "orderId", e.aggregateId(),
                                "reason", e.reasonMessage() == null ? "" : e.reasonMessage()))
                        .referenceId(e.aggregateId()).referenceType("ORDER").build()));
    }

    @EventListener
    public void on(OrderDomainEvent.OrderCancelled e) {
        List.of("SALES_MANAGER", "CS_AGENT", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("OMS")
                        .eventType("ORDER_CANCELLED")
                        .titleKey("notification.oms.ORDER_CANCELLED.title")
                        .bodyKey("notification.oms.ORDER_CANCELLED.body")
                        .params(Map.of(
                                "orderId", e.aggregateId(),
                                "reason", e.reasonCode() == null ? "" : e.reasonCode()))
                        .referenceId(e.aggregateId()).referenceType("ORDER").build()));
    }
}
