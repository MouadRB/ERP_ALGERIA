package com.dz.erp.pim.product.infrastructure.event;

import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.pim.product.application.ProductService;
import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import com.dz.erp.pim.product.domain.port.ProductEventPort;
import com.dz.erp.pim.variant.application.VariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Listens for intra-engine events.
 * No @Async — synchronous, same transaction. If PIM update fails, source rolls back.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductIntraEngineEventListener {
    private final ProductService productService;
    private final VariantService variantService;
    private final ProductEventPort productEventPort;

    @EventListener
    public void on(ProductDomainEvent.Created e) {
        log.info("PIM: Product created {} (SKU: {})", e.aggregateId(), e.skuCode());
    }

    @EventListener
    public void on(ProductDomainEvent.Activated e) {
        log.info("PIM: Product activated {} → Catalog will index", e.aggregateId());
    }

    @EventListener
    public void on(ProductDomainEvent.ActivatedFromOcr e) {
        log.info("PIM: OCR product activated {} → Catalog will index", e.aggregateId());
    }

    @EventListener
    public void on(ProductDomainEvent.Discontinued e) {
        log.info("PIM: Product discontinued {} → Catalog will remove", e.aggregateId());
    }

    @EventListener
    public void on(ProductDomainEvent.Flagged e) {
        log.warn("PIM: Product flagged {} (return rate {}%)", e.aggregateId(), e.returnRate());
    }

    // ── Inventory → PIM: sync stock quantities ──

    @EventListener
    public void on(InventoryDomainEvent.StockUpdated e) {
        log.info("PIM: Stock updated for SKU {} → qty={}, available={}", e.skuCode(), e.newTotalQuantity(), e.available());
        variantService.updateStockFromInventory(e.skuCode(), e.tenantId(), e.newTotalQuantity());
        productService.recalculateTotalStock(e.skuCode(), e.tenantId());
    }

    // ── Inventory → PIM: stock alert notifications ──

    @EventListener
    public void on(InventoryDomainEvent.ReorderTriggered e) {
        log.warn("PIM: Reorder triggered for SKU {} — stock={}, threshold={}",
                e.skuCode(), e.currentStock(), e.threshold());
        productEventPort.publish("PRODUCT_STOCK_LOW", e.skuCode(),
                new ProductDomainEvent.StockLow(
                        UUID.randomUUID().toString(), "PRODUCT_STOCK_LOW", 1,
                        e.tenantId(), "Product", e.skuCode(), Instant.now(),
                        e.skuCode(), e.currentStock(), e.threshold()));
    }

    @EventListener
    public void on(InventoryDomainEvent.StockZero e) {
        log.warn("PIM: Stock zero for SKU {}", e.skuCode());
        productEventPort.publish("PRODUCT_OUT_OF_STOCK", e.skuCode(),
                new ProductDomainEvent.OutOfStock(
                        UUID.randomUUID().toString(), "PRODUCT_OUT_OF_STOCK", 1,
                        e.tenantId(), "Product", e.skuCode(), Instant.now(),
                        e.skuCode()));
    }
}
