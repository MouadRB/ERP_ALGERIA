package com.dz.erp.catalog.product.infrastructure.listener;

import com.dz.erp.catalog.category.domain.port.CategoryRepository;
import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.product.infrastructure.event.CatalogProductEventPublisher;
import com.dz.erp.catalog.product.infrastructure.scheduler.CatalogSchedulerService;
import com.dz.erp.catalog.shared.domain.MaskedReason;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.pim.product.domain.event.ProductDomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogEventListener {

    private final CatalogProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final CatalogProductEventPublisher eventPublisher;
    private final CatalogSchedulerService schedulerService;

    /**
     * PIM product activated → create CatalogProduct in DRAFT if not exists.
     */
    @EventListener
    @Transactional
    public void handleProductActivated(ProductDomainEvent.Activated event) {
        var skuCode = event.skuCode();
        var tid = event.tenantId();

        if (productRepo.findBySkuCodeAndTenantId(skuCode, tid).isPresent()) {
            log.debug("Catalog: product {} already exists — skip", skuCode);
            return;
        }

        var categoryOpt = categoryRepo.findByCodeAndTenantId(event.categoryCode(), tid);
        if (categoryOpt.isEmpty()) {
            log.warn("Catalog: category {} not found for product {} — skip", event.categoryCode(), skuCode);
            return;
        }

        var product = CatalogProduct.create(skuCode, categoryOpt.get().getId(), tid);
        productRepo.save(product);

        eventPublisher.publish("CATEGORY_ASSIGNED", skuCode,
                new CatalogDomainEvent.CategoryAssigned(skuCode, categoryOpt.get().getId(), tid));

        log.info("Catalog: product {} created in DRAFT (category={})", skuCode, event.categoryCode());
    }

    /**
     * PIM product discontinued → mask on all channels (terminal).
     */
    @EventListener
    @Transactional
    public void handleProductDiscontinued(ProductDomainEvent.Discontinued event) {
        var opt = productRepo.findBySkuCodeAndTenantId(event.skuCode(), event.tenantId());
        if (opt.isEmpty()) return;

        var product = opt.get();
        product.discontinue();
        productRepo.save(product);

        eventPublisher.publish("PRODUCT_DISCONTINUED", event.skuCode(),
                new CatalogDomainEvent.ProductDiscontinuedInCatalog(event.skuCode(), event.tenantId()));

        log.info("Catalog: product {} discontinued", event.skuCode());
    }

    /**
     * PIM product updated → check price/OCR status changes and auto-mask if needed.
     */
    @EventListener
    @Transactional
    public void handleProductUpdated(ProductDomainEvent.Updated event) {
        var opt = productRepo.findBySkuCodeAndTenantId(event.skuCode(), event.tenantId());
        if (opt.isEmpty()) return;

        var product = opt.get();

        if (event.priceTtc() != null && event.priceTtc().signum() == 0
                && product.getStatus() == PublicationStatus.PUBLISHED) {
            product.maskAuto(MaskedReason.PRICE_ZERO);
            productRepo.save(product);
            eventPublisher.publish("PRODUCT_MASKED_AUTO", event.skuCode(),
                    new CatalogDomainEvent.ProductMaskedAuto(event.skuCode(), MaskedReason.PRICE_ZERO,
                            Set.copyOf(product.getActiveChannels()), event.tenantId()));
            log.info("Catalog: product {} auto-masked (PRICE_ZERO)", event.skuCode());
            return;
        }

        if ("OCR_IMPORT".equals(event.pimStatus())
                && product.getStatus() == PublicationStatus.PUBLISHED) {
            product.maskAuto(MaskedReason.OCR_DRAFT);
            productRepo.save(product);
            eventPublisher.publish("PRODUCT_MASKED_AUTO", event.skuCode(),
                    new CatalogDomainEvent.ProductMaskedAuto(event.skuCode(), MaskedReason.OCR_DRAFT,
                            Set.copyOf(product.getActiveChannels()), event.tenantId()));
            log.info("Catalog: product {} auto-masked (OCR_DRAFT)", event.skuCode());
            return;
        }

        log.debug("Catalog: product {} updated — no rule violations", event.skuCode());
    }

    // ── Website sync: upload on publish, remove on mask/discontinue ──

    @EventListener
    public void handleWebsiteUpload(CatalogDomainEvent.ProductPublished event) {
        schedulerService.uploadToWebsite(event.skuCode(), event.tenantId());
    }

    @EventListener
    public void handleWebsiteRemoveMaskedAuto(CatalogDomainEvent.ProductMaskedAuto event) {
        schedulerService.removeFromWebsite(event.skuCode(), event.tenantId());
    }

    @EventListener
    public void handleWebsiteRemoveMaskedManual(CatalogDomainEvent.ProductMaskedManual event) {
        schedulerService.removeFromWebsite(event.skuCode(), event.tenantId());
    }

    @EventListener
    public void handleWebsiteRemoveDiscontinued(CatalogDomainEvent.ProductDiscontinuedInCatalog event) {
        schedulerService.removeFromWebsite(event.skuCode(), event.tenantId());
    }

    // ── Inventory → Catalog: stock zero / replenished ──

    @EventListener
    @Transactional
    public void handleStockZero(InventoryDomainEvent.StockZero event) {
        var opt = productRepo.findBySkuCodeAndTenantId(event.skuCode(), event.tenantId());
        if (opt.isEmpty()) return;

        var product = opt.get();
        if (product.getStatus() == PublicationStatus.PUBLISHED) {
            product.maskAuto(MaskedReason.AUTO_STOCK_ZERO);
            productRepo.save(product);
            log.info("Catalog: product {} auto-masked (AUTO_STOCK_ZERO)", event.skuCode());
        }
    }

    @EventListener
    @Transactional
    public void handleStockReplenished(InventoryDomainEvent.StockReplenished event) {
        var opt = productRepo.findBySkuCodeAndTenantId(event.skuCode(), event.tenantId());
        if (opt.isEmpty()) return;

        var product = opt.get();
        if (product.getStatus() == PublicationStatus.MASKED_AUTO
                && product.getMaskedReason() == MaskedReason.AUTO_STOCK_ZERO) {
            product.unmask();
            productRepo.save(product);
            log.info("Catalog: product {} unmasked (stock replenished)", event.skuCode());
        }
    }
}
