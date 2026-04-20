package com.dz.erp.inventory.stock.infrastructure.event;

import com.dz.erp.inventory.stock.application.service.StockRecordService;
import com.dz.erp.pim.logistics.domain.event.LogisticsDomainEvent;
import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import com.dz.erp.pim.variant.domain.event.VariantDomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventListener {
    private final StockRecordService stockRecordService;

    @EventListener
    public void on(ProductDomainEvent.Created e) {
        log.info("[Inventory] Product created: {} -- initializing stock record", e.skuCode());
        stockRecordService.initializeForProduct(e.skuCode(), e.aggregateId(), e.tenantId());
    }

    @EventListener
    public void on(ProductDomainEvent.Activated e) {
        log.info("[Inventory] Product activated: {} -- marking trackable", e.skuCode());
        stockRecordService.markTrackable(e.skuCode(), e.tenantId());
    }

    @EventListener
    public void on(ProductDomainEvent.Discontinued e) {
        log.info("[Inventory] Product discontinued: {} -- freezing stock", e.skuCode());
        stockRecordService.freezeStock(e.skuCode(), e.tenantId());
    }

    @EventListener
    public void on(VariantDomainEvent.Created e) {
        log.info("[Inventory] Variant created: {} (SKU: {}) -- initializing stock record", e.variantId(), e.skuCode());
        stockRecordService.initializeForVariant(e.skuCode(), e.variantId(), e.tenantId());
    }

    // ── PIM Logistics → Inventory: sync threshold ──

    @EventListener
    public void on(LogisticsDomainEvent.ThresholdUpdated e) {
        log.info("[Inventory] Threshold updated from PIM for SKU {} → alertThreshold={}, reorderQty={}",
                e.skuCode(), e.stockAlertThreshold(), e.reorderQuantity());
        stockRecordService.updateThresholdsBySkuCode(
                e.skuCode(), e.tenantId(), e.stockAlertThreshold(), e.reorderQuantity());
    }
}
