package com.dz.erp.oms.integration.infrastructure.event;

import com.dz.erp.oms.integration.domain.event.ShipmentDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ShipmentNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void onFailed(ShipmentDomainEvent.ShipmentFailed e) {
        notify(e, "CS_AGENT", "SHIPMENT_FAILED", Map.of(
                "orderId", e.orderId(),
                "carrier", e.carrierCode(),
                "reason", e.reasonCode() != null ? e.reasonCode() : ""));
        notify(e, "SUPER_ADMIN", "SHIPMENT_FAILED", Map.of(
                "orderId", e.orderId(),
                "carrier", e.carrierCode(),
                "reason", e.reasonCode() != null ? e.reasonCode() : ""));
    }

    @EventListener
    public void onDelivered(ShipmentDomainEvent.ShipmentDelivered e) {
        notify(e, "SALES_MANAGER", "SHIPMENT_DELIVERED", Map.of(
                "orderId", e.orderId(),
                "carrier", e.carrierCode()));
    }

    private void notify(ShipmentDomainEvent e, String role, String type, Map<String, String> params) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole(role).module("OMS")
                .eventType(type)
                .titleKey("notification.oms." + type + ".title")
                .bodyKey("notification.oms." + type + ".body")
                .params(params)
                .referenceId(e.aggregateId())
                .referenceType("CARRIER_SHIPMENT")
                .build());
    }
}
