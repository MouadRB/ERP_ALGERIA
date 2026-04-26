package com.dz.erp.oms.returns.infrastructure.event;

import com.dz.erp.oms.returns.domain.event.ReturnDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Bell notifications for customer-return lifecycle — same pattern as
 * {@code PimNotificationListener}: one {@code @EventListener} method per
 * domain-event subtype, each builds a {@link NotificationCreateCommand}
 * and delegates to {@link NotificationService#create}.
 */
@Component
@RequiredArgsConstructor
public class ReturnNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void on(ReturnDomainEvent.ReturnRequested e) {
        List.of("CS_AGENT", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("OMS")
                        .eventType("RETURN_REQUESTED")
                        .titleKey("notification.oms.RETURN_REQUESTED.title")
                        .bodyKey("notification.oms.RETURN_REQUESTED.body")
                        .params(Map.of(
                                "orderId", e.orderId(),
                                "reason", e.reasonCode() == null ? "" : e.reasonCode(),
                                "lineCount", String.valueOf(e.lineCount())))
                        .referenceId(e.aggregateId())
                        .referenceType("RETURN").build()));
    }

    @EventListener
    public void on(ReturnDomainEvent.ReturnClosed e) {
        String type = e.approved() ? "RETURN_APPROVED" : "RETURN_REJECTED";
        List.of("CS_AGENT", "FINANCE_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("OMS")
                        .eventType(type)
                        .titleKey("notification.oms." + type + ".title")
                        .bodyKey("notification.oms." + type + ".body")
                        .params(Map.of("orderId", e.orderId()))
                        .referenceId(e.aggregateId())
                        .referenceType("RETURN").build()));
    }
}
