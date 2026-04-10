package com.dz.erp.pim.product.infrastructure.event;

import com.dz.erp.pim.product.application.ProductService;
import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import com.dz.erp.pim.variant.application.VariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listens for intra-engine events.
 * No @Async — synchronous, same transaction. If PIM update fails, source rolls back.
 * <p>
 * When Inventory is built, add:
 *
 * @EventListener void onStockUpdated(InventoryDomainEvent.StockUpdated event) {
 * variantService.updateStockFromInventory(event.skuCode(), event.tenantId(), event.newQuantity());
 * productService.recalculateTotalStock(event.productId(), event.tenantId());
 * }
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProductIntraEngineEventListener {
    private final ProductService productService;
    private final VariantService variantService;

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


}
