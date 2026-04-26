package com.dz.erp.catalog.product.infrastructure.listener;

import com.dz.erp.catalog.category.domain.event.CatalogCategoryDomainEvent;
import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;
import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.shared.notification.application.NotificationService;
import com.dz.erp.shared.notification.application.dto.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Listens to Catalog domain events and creates notifications
 * for the relevant roles — same pattern as PimNotificationListener.
 */
@Component
@RequiredArgsConstructor
public class CatalogNotificationListener {

    private final NotificationService notificationService;

    // ── Product events ──

    @EventListener
    public void on(CatalogDomainEvent.ProductPublished e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("PRODUCT_PUBLISHED")
                        .titleKey("notification.catalog.PRODUCT_PUBLISHED.title")
                        .bodyKey("notification.catalog.PRODUCT_PUBLISHED.body")
                        .params(Map.of("skuCode", e.skuCode(), "channels", e.channels().toString()))
                        .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build()));
    }

    @EventListener
    public void on(CatalogDomainEvent.ProductMaskedAuto e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("PRODUCT_MASKED_AUTO")
                        .titleKey("notification.catalog.PRODUCT_MASKED_AUTO.title")
                        .bodyKey("notification.catalog.PRODUCT_MASKED_AUTO.body")
                        .params(Map.of("skuCode", e.skuCode(), "reason", e.reason().name()))
                        .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build()));
    }

    @EventListener
    public void on(CatalogDomainEvent.ProductMaskedManual e) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole("SUPER_ADMIN").module("CATALOG").eventType("PRODUCT_MASKED_MANUAL")
                .titleKey("notification.catalog.PRODUCT_MASKED_MANUAL.title")
                .bodyKey("notification.catalog.PRODUCT_MASKED_MANUAL.body")
                .params(Map.of("skuCode", e.skuCode(), "actorName", e.actorId()))
                .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build());
    }

    @EventListener
    public void on(CatalogDomainEvent.ProductScheduled e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("PRODUCT_SCHEDULED")
                        .titleKey("notification.catalog.PRODUCT_SCHEDULED.title")
                        .bodyKey("notification.catalog.PRODUCT_SCHEDULED.body")
                        .params(Map.of("skuCode", e.skuCode(), "scheduledAt", e.scheduledAt().toString()))
                        .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build()));
    }

    @EventListener
    public void on(CatalogDomainEvent.ProductDiscontinuedInCatalog e) {
        List.of("PRODUCT_MANAGER", "INVENTORY_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("PRODUCT_DISCONTINUED")
                        .titleKey("notification.catalog.PRODUCT_DISCONTINUED.title")
                        .bodyKey("notification.catalog.PRODUCT_DISCONTINUED.body")
                        .params(Map.of("skuCode", e.skuCode()))
                        .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build()));
    }

    @EventListener
    public void on(CatalogDomainEvent.ChannelChanged e) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole("PRODUCT_MANAGER").module("CATALOG").eventType("CHANNEL_CHANGED")
                .titleKey("notification.catalog.CHANNEL_CHANGED.title")
                .bodyKey("notification.catalog.CHANNEL_CHANGED.body")
                .params(Map.of("skuCode", e.skuCode(), "channel", e.channel().name(),
                        "enabled", String.valueOf(e.enabled())))
                .referenceId(e.skuCode()).referenceType("CATALOG_PRODUCT").build());
    }

    // ── Category events ──

    @EventListener
    public void on(CatalogCategoryDomainEvent.Created e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("CATEGORY_CREATED")
                        .titleKey("notification.catalog.CATEGORY_CREATED.title")
                        .bodyKey("notification.catalog.CATEGORY_CREATED.body")
                        .params(Map.of("code", e.code(), "createdBy", e.createdBy()))
                        .referenceId(e.categoryId()).referenceType("CATEGORY").build()));
    }

    @EventListener
    public void on(CatalogCategoryDomainEvent.Deleted e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("CATEGORY_DELETED")
                        .titleKey("notification.catalog.CATEGORY_DELETED.title")
                        .bodyKey("notification.catalog.CATEGORY_DELETED.body")
                        .params(Map.of("code", e.code()))
                        .referenceId(e.categoryId()).referenceType("CATEGORY").build()));
    }

    // ── Channel events ──

    @EventListener
    public void on(ChannelDomainEvent.SyncCompleted e) {
        notificationService.create(NotificationCreateCommand.builder()
                .tenantId(e.tenantId()).targetRole("SUPER_ADMIN").module("CATALOG").eventType("SYNC_COMPLETED")
                .titleKey("notification.catalog.SYNC_COMPLETED.title")
                .bodyKey("notification.catalog.SYNC_COMPLETED.body")
                .params(Map.of("channel", e.channelType().name(),
                        "syncedCount", String.valueOf(e.syncedCount()),
                        "errorCount", String.valueOf(e.errorCount())))
                .referenceId(e.channelType().name()).referenceType("CHANNEL").build());
    }

    @EventListener
    public void on(ChannelDomainEvent.ChannelActivated e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("CHANNEL_ACTIVATED")
                        .titleKey("notification.catalog.CHANNEL_ACTIVATED.title")
                        .bodyKey("notification.catalog.CHANNEL_ACTIVATED.body")
                        .params(Map.of("channel", e.channelType().name(), "actorName", e.actorId()))
                        .referenceId(e.channelType().name()).referenceType("CHANNEL").build()));
    }

    @EventListener
    public void on(ChannelDomainEvent.ChannelDeactivated e) {
        List.of("PRODUCT_MANAGER", "SUPER_ADMIN").forEach(role ->
                notificationService.create(NotificationCreateCommand.builder()
                        .tenantId(e.tenantId()).targetRole(role).module("CATALOG").eventType("CHANNEL_DEACTIVATED")
                        .titleKey("notification.catalog.CHANNEL_DEACTIVATED.title")
                        .bodyKey("notification.catalog.CHANNEL_DEACTIVATED.body")
                        .params(Map.of("channel", e.channelType().name(), "actorName", e.actorId()))
                        .referenceId(e.channelType().name()).referenceType("CHANNEL").build()));
    }
}
