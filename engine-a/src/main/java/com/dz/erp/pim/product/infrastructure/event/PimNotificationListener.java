package com.dz.erp.pim.product.infrastructure.event;

import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PimNotificationListener {
    private final NotificationService notificationService;

    @EventListener
    public void on(ProductDomainEvent.Created e) {
        List.of("INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("PIM").eventType("PRODUCT_CREATED")
                        .titleKey("notification.pim.PRODUCT_CREATED.title").bodyKey("notification.pim.PRODUCT_CREATED.body")
                        .params(Map.of("nameFr", e.nameFr(), "skuCode", e.skuCode()))
                        .referenceId(e.aggregateId()).referenceType("PRODUCT").build()));
    }

    @EventListener
    public void on(ProductDomainEvent.Activated e) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole("PRODUCT_MANAGER").module("PIM").eventType("PRODUCT_ACTIVATED")
                .titleKey("notification.pim.PRODUCT_ACTIVATED.title").bodyKey("notification.pim.PRODUCT_ACTIVATED.body")
                .params(Map.of("nameFr", e.nameFr(), "skuCode", e.skuCode(), "actorName", e.activatedBy()))
                .referenceId(e.aggregateId()).referenceType("PRODUCT").build());
    }

    @EventListener
    public void on(ProductDomainEvent.ActivatedFromOcr e) {
        List.of("PRODUCT_MANAGER", "PROCUREMENT_MANAGER").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("PIM").eventType("PRODUCT_ACTIVATED_FROM_OCR")
                        .titleKey("notification.pim.PRODUCT_ACTIVATED_FROM_OCR.title").bodyKey("notification.pim.PRODUCT_ACTIVATED_FROM_OCR.body")
                        .params(Map.of("nameFr", e.nameFr(), "skuCode", e.skuCode(), "actorName", e.activatedBy()))
                        .referenceId(e.productId()).referenceType("PRODUCT").build()));
    }

    @EventListener
    public void on(ProductDomainEvent.Flagged e) {
        List.of("PRODUCT_MANAGER", "INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("PIM").eventType("PRODUCT_FLAGGED")
                        .titleKey("notification.pim.PRODUCT_FLAGGED.title").bodyKey("notification.pim.PRODUCT_FLAGGED.body")
                        .params(Map.of("nameFr", e.nameFr(), "skuCode", e.skuCode(), "returnRate", e.returnRate().toPlainString()))
                        .referenceId(e.aggregateId()).referenceType("PRODUCT").build()));
    }

    @EventListener
    public void on(ProductDomainEvent.Discontinued e) {
        List.of("PRODUCT_MANAGER", "INVENTORY_MANAGER", "PROCUREMENT_MANAGER").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("PIM").eventType("PRODUCT_DISCONTINUED")
                        .titleKey("notification.pim.PRODUCT_DISCONTINUED.title").bodyKey("notification.pim.PRODUCT_DISCONTINUED.body")
                        .params(Map.of("nameFr", e.nameFr(), "skuCode", e.skuCode(), "actorName", e.discontinuedBy()))
                        .referenceId(e.aggregateId()).referenceType("PRODUCT").build()));
    }
}
