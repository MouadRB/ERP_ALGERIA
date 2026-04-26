package com.dz.erp.catalog.product.infrastructure.scheduler;

import com.dz.erp.catalog.category.domain.port.CategoryRepository;
import com.dz.erp.catalog.channel.domain.port.SalesChannelRepository;
import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.product.domain.port.WebsiteUploadPort;
import com.dz.erp.catalog.product.infrastructure.event.CatalogProductEventPublisher;
import com.dz.erp.catalog.search.shared.port.MdmDataPort;
import com.dz.erp.catalog.search.shared.port.PimDataPort;
import com.dz.erp.catalog.search.shared.port.dto.PimSnapshots.*;
import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.MaskedReason;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogSchedulerService {

    private final CatalogProductRepository productRepo;
    private final CatalogProductEventPublisher eventPublisher;
    private final SalesChannelRepository channelRepo;
    private final WebsiteUploadPort websiteUploadPort;
    private final PimDataPort pimDataPort;
    private final MdmDataPort mdmDataPort;
    private final CategoryRepository categoryRepo;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processScheduledPublications() {
        var now = LocalDateTime.now();
        var tenantIds = channelRepo.findAllTenantIds();

        for (var tenantId : tenantIds) {
            var products = productRepo.findScheduledBefore(now, tenantId);
            if (products.isEmpty()) continue;

            int count = 0;
            for (var product : products) {
                try {
                    var channels = product.getActiveChannels().isEmpty()
                            ? EnumSet.of(ChannelType.WEB) : product.getActiveChannels();
                    product.publish("SYSTEM", channels);
                    productRepo.save(product);

                    eventPublisher.publish("PRODUCT_PUBLISHED", product.getSkuCode(),
                            new CatalogDomainEvent.ProductPublished(product.getSkuCode(),
                                    Set.copyOf(channels), "SYSTEM", tenantId));
                    count++;
                } catch (Exception e) {
                    log.error("Scheduler: failed to publish {} — {}", product.getSkuCode(), e.getMessage());
                }
            }
            if (count > 0) log.info("Scheduler: published {} scheduled products for tenant {}", count, tenantId);
        }
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processAutoDepublications() {
        var now = LocalDateTime.now();
        var tenantIds = channelRepo.findAllTenantIds();

        for (var tenantId : tenantIds) {
            var products = productRepo.findAutoUnpublishBefore(now, tenantId);
            if (products.isEmpty()) continue;

            int count = 0;
            for (var product : products) {
                try {
                    product.maskAuto(MaskedReason.AUTO_UNPUBLISH_EXPIRED);
                    productRepo.save(product);

                    eventPublisher.publish("PRODUCT_MASKED_AUTO", product.getSkuCode(),
                            new CatalogDomainEvent.ProductMaskedAuto(product.getSkuCode(),
                                    MaskedReason.AUTO_UNPUBLISH_EXPIRED,
                                    Set.copyOf(product.getActiveChannels()), tenantId));
                    count++;
                } catch (Exception e) {
                    log.error("Scheduler: failed to auto-depublish {} — {}", product.getSkuCode(), e.getMessage());
                }
            }
            if (count > 0) log.info("Scheduler: auto-depublished {} products for tenant {}", count, tenantId);
        }
    }

    /**
     * Uploads all PUBLISHED products to the sales website.
     * Runs every 5 minutes. Assembles the full product document (PIM + MDM + Category data)
     * and pushes it via WebsiteUploadPort.
     *
     * When the website is ready, replace DefaultWebsiteUploadAdapter with your own implementation.
     */
    @Scheduled(fixedDelay = 300_000)
    @Transactional(readOnly = true)
    public void syncPublishedToWebsite() {
        var tenantIds = channelRepo.findAllTenantIds();

        for (var tenantId : tenantIds) {
            var published = productRepo.findAllByStatusAndTenantId(PublicationStatus.PUBLISHED, tenantId);
            if (published.isEmpty()) continue;

            var batch = new ArrayList<CatalogProductIndexDocument>(50);
            int uploaded = 0;
            int errors = 0;

            for (var product : published) {
                try {
                    var doc = buildWebsiteDocument(product.getSkuCode(), tenantId, product);
                    if (doc != null) {
                        batch.add(doc);
                    }

                    if (batch.size() >= 50) {
                        uploaded += websiteUploadPort.bulkUpload(batch);
                        batch.clear();
                    }
                } catch (Exception e) {
                    errors++;
                    log.warn("Website sync: failed to build document for {} — {}", product.getSkuCode(), e.getMessage());
                }
            }

            if (!batch.isEmpty()) {
                uploaded += websiteUploadPort.bulkUpload(batch);
            }

            if (uploaded > 0 || errors > 0) {
                log.info("Website sync: {} uploaded, {} errors for tenant {}", uploaded, errors, tenantId);
            }
        }
    }

    /**
     * Upload a single product to the website. Called when a product status changes to PUBLISHED.
     */
    public void uploadToWebsite(String skuCode, String tenantId) {
        var product = productRepo.findBySkuCodeAndTenantId(skuCode, tenantId).orElse(null);
        if (product == null || product.getStatus() != PublicationStatus.PUBLISHED) {
            log.warn("Website upload: product {} not found or not PUBLISHED — skipping", skuCode);
            return;
        }

        var doc = buildWebsiteDocument(skuCode, tenantId, product);
        if (doc != null) {
            boolean ok = websiteUploadPort.upload(doc);
            if (ok) log.info("Website upload: {} (tenant {})", skuCode, tenantId);
        }
    }

    /**
     * Remove a product from the website. Called when a product is masked or discontinued.
     */
    public void removeFromWebsite(String skuCode, String tenantId) {
        boolean ok = websiteUploadPort.remove(skuCode, tenantId);
        if (ok) log.info("Website remove: {} (tenant {})", skuCode, tenantId);
    }

    // ── Document assembly for website ──

    private CatalogProductIndexDocument buildWebsiteDocument(
            String skuCode, String tenantId,
            com.dz.erp.catalog.product.domain.model.CatalogProduct catalogProduct) {

        String token = resolveToken();

        PimProductSnapshot pimProduct;
        try {
            pimProduct = pimDataPort.getProduct(skuCode, token);
        } catch (Exception e) {
            log.warn("Website sync: PIM product fetch failed for {} — {}", skuCode, e.getMessage());
            return null;
        }
        if (pimProduct == null) {
            log.warn("Website sync: PIM returned null for {} — skipping", skuCode);
            return null;
        }

        PimPricingSnapshot pricing = safeFetch(() -> pimDataPort.getPricing(skuCode, token));
        PimSeoSnapshot seo = safeFetch(() -> pimDataPort.getSeo(skuCode, token));
        List<PimMediaSnapshot> media = safeFetchList(() -> pimDataPort.getMedia(skuCode, token));
        List<PimVariantSnapshot> variants = safeFetchList(() -> pimDataPort.getVariants(skuCode, token));
        List<String> wilayas = token != null ? safeFetchList(() -> mdmDataPort.getDeliverableWilayaCodes(token)) : List.of();

        var categoryPath = buildCategoryPath(catalogProduct, tenantId);

        var principalImageUrl = media.stream()
                .filter(m -> "PRINCIPAL".equals(m.mediaType()))
                .findFirst()
                .map(PimMediaSnapshot::fileUrl)
                .orElse(null);

        var variantLabels = variants.stream()
                .map(PimVariantSnapshot::label)
                .filter(l -> l != null && !l.isBlank())
                .toList();

        var channels = catalogProduct.getActiveChannels().stream().map(Enum::name).toList();

        var badges = new ArrayList<String>();
        if (catalogProduct.isBadgeStockLimit()
                && pimProduct.totalStock() <= catalogProduct.getStockLimitThreshold()) {
            badges.add("STOCK_LIMITE");
        }
        if (catalogProduct.isFeaturedHomepage()) {
            badges.add("HOMEPAGE_FEATURED");
        }

        String categoryNameFr = null;
        String categoryNameAr = null;
        if (catalogProduct.getCategoryId() != null) {
            var cat = categoryRepo.findByIdAndTenantId(catalogProduct.getCategoryId(), tenantId).orElse(null);
            if (cat != null) {
                categoryNameFr = cat.getNameFr();
                categoryNameAr = cat.getNameAr();
            }
        }

        return new CatalogProductIndexDocument(
                skuCode, tenantId,
                pimProduct.nameFr(), pimProduct.nameAr(),
                pimProduct.descriptionFr(), pimProduct.descriptionAr(),
                pimProduct.brand(),
                pricing != null ? pricing.priceTtc() : BigDecimal.ZERO,
                pimProduct.totalStock(),
                principalImageUrl,
                pimProduct.returnRate(),
                categoryPath, categoryNameFr, categoryNameAr,
                channels, badges,
                catalogProduct.getVisibilityScore(),
                null,
                Instant.now(),
                seo != null ? seo.keywords() : List.of(),
                variantLabels,
                wilayas,
                Instant.now()
        );
    }

    private List<String> buildCategoryPath(
            com.dz.erp.catalog.product.domain.model.CatalogProduct product, String tenantId) {
        if (product == null || product.getCategoryId() == null) return List.of();

        var path = new ArrayList<String>();
        var catOpt = categoryRepo.findByIdAndTenantId(product.getCategoryId(), tenantId);

        while (catOpt.isPresent()) {
            var cat = catOpt.get();
            path.addFirst(cat.getNameFr());
            if (cat.getParentId() == null) break;
            catOpt = categoryRepo.findByIdAndTenantId(cat.getParentId(), tenantId);
        }
        return path;
    }

    private String resolveToken() {
        try {
            return AuthContext.getJwt();
        } catch (Exception e) {
            return null;
        }
    }

    private <T> T safeFetch(java.util.function.Supplier<T> supplier) {
        try { return supplier.get(); }
        catch (Exception e) { return null; }
    }

    private <T> List<T> safeFetchList(java.util.function.Supplier<List<T>> supplier) {
        try {
            var r = supplier.get();
            return r != null ? r : List.of();
        } catch (Exception e) { return List.of(); }
    }
}
