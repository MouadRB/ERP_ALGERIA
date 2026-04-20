package com.dz.erp.catalog.search.application;

import com.dz.erp.catalog.category.domain.port.CategoryRepository;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;
import com.dz.erp.catalog.search.domain.port.SearchIndexPort;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.catalog.search.shared.port.MdmDataPort;
import com.dz.erp.catalog.search.shared.port.PimDataPort;
import com.dz.erp.catalog.search.shared.port.dto.PimSnapshots.*;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Application service — builds OpenSearch index documents from multiple data sources,
 * then delegates indexing to SearchIndexPort (infrastructure).
 *
 * Data assembly:
 *   1. CatalogProduct (local DB) → channels, badges, visibility score
 *   2. PIM (REST) → names, price, keywords, variants, images, returnRate
 *   3. MDM (REST) → deliverable wilaya codes
 *   4. Category (local DB) → category path for faceted search
 *
 * All PIM/MDM calls forward the JWT via AuthContext.getJwt().
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogSearchIndexer {

    private final CatalogProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final PimDataPort pimDataPort;
    private final MdmDataPort mdmDataPort;
    private final SearchIndexPort searchIndexPort;

    // ──────────────────────────────────────────────
    // Single product operations
    // ──────────────────────────────────────────────

    /**
     * Index a single product. Called on:
     *   - ProductPublished event
     *   - ChannelChanged event (re-index with updated channels)
     *   - StockUpdated event (re-index with updated stock)
     */
    public void indexProduct(String skuCode, String tenantId) {
        var opt = productRepo.findBySkuCodeAndTenantId(skuCode, tenantId);
        if (opt.isEmpty()) {
            log.warn("OpenSearch index: product {} not found in catalog — skipping", skuCode);
            return;
        }

        var product = opt.get();
        var doc = buildDocument(product.getSkuCode(), tenantId);
        if (doc != null) {
            searchIndexPort.indexProduct(doc);
        }
    }

    /**
     * Remove a product from the index. Called on:
     *   - ProductMaskedAuto event
     *   - ProductMaskedManual event
     *   - ProductDiscontinuedInCatalog event
     *
     * Idempotent — ignores 404.
     */
    public void removeFromIndex(String skuCode, String tenantId) {
        searchIndexPort.removeProduct(skuCode, tenantId);
    }

    // ──────────────────────────────────────────────
    // Bulk operations
    // ──────────────────────────────────────────────

    /**
     * Full re-index of all PUBLISHED products for a tenant.
     * Runs async — triggered by POST /catalog/v1/opensearch/reindex.
     *
     * Logs progress every 50 products for monitoring.
     * Uses bulk API for efficiency (batches of 50).
     */
    @Async
    public void reindexAll(String tenantId) {
        log.info("OpenSearch reindex: starting full reindex for tenant {}", tenantId);
        var allPublished = productRepo.findAllByStatusAndTenantId(PublicationStatus.PUBLISHED, tenantId);

        int total = allPublished.size();
        int indexed = 0;
        int errors = 0;
        var batch = new ArrayList<CatalogProductIndexDocument>(50);

        for (var product : allPublished) {
            try {
                var doc = buildDocument(product.getSkuCode(), tenantId);
                if (doc != null) {
                    batch.add(doc);
                }

                // Flush batch every 50 documents
                if (batch.size() >= 50) {
                    searchIndexPort.bulkIndex(batch);
                    indexed += batch.size();
                    batch.clear();
                    log.info("OpenSearch reindex: progress {}/{} for tenant {}", indexed, total, tenantId);
                }
            } catch (Exception e) {
                errors++;
                log.warn("OpenSearch reindex: failed to build document for {} — {}",
                        product.getSkuCode(), e.getMessage());
            }
        }

        // Flush remaining
        if (!batch.isEmpty()) {
            searchIndexPort.bulkIndex(batch);
            indexed += batch.size();
        }

        log.info("OpenSearch reindex complete: {} indexed, {} errors, {} total for tenant {}",
                indexed, errors, total, tenantId);
    }

    // ──────────────────────────────────────────────
    // Health / Status
    // ──────────────────────────────────────────────

    /**
     * Get OpenSearch cluster health + index stats for the tenant.
     */
    public SearchIndexPort.IndexStatus getIndexHealth(String tenantId) {
        return searchIndexPort.getStatus(tenantId);
    }

    // ──────────────────────────────────────────────
    // Private — Document assembly
    // ──────────────────────────────────────────────

    /**
     * Build a complete index document by assembling data from 4 sources.
     * Returns null if PIM data is unavailable (product won't be indexed).
     */
    private CatalogProductIndexDocument buildDocument(String skuCode, String tenantId) {
        var token = AuthContext.getJwt();

        // 1. Fetch product content from PIM via REST
        PimProductSnapshot product;
        try {
            product = pimDataPort.getProduct(skuCode, token);
        } catch (Exception e) {
            log.warn("OpenSearch: PIM product fetch failed for {} — {}", skuCode, e.getMessage());
            return null;
        }
        if (product == null) {
            log.warn("OpenSearch: PIM returned null for {} — skipping", skuCode);
            return null;
        }

        // 2. Fetch pricing, SEO, media, variants from PIM
        PimPricingSnapshot pricing = safeFetch(() -> pimDataPort.getPricing(skuCode, token), "pricing", skuCode);
        PimSeoSnapshot seo = safeFetch(() -> pimDataPort.getSeo(skuCode, token), "seo", skuCode);
        List<PimMediaSnapshot> media = safeFetchList(() -> pimDataPort.getMedia(skuCode, token), "media", skuCode);
        List<PimVariantSnapshot> variants = safeFetchList(() -> pimDataPort.getVariants(skuCode, token), "variants", skuCode);

        // 3. Fetch deliverable wilayas from MDM
        List<String> wilayas = safeFetchList(() -> mdmDataPort.getDeliverableWilayaCodes(token), "wilayas", skuCode);

        // 4. Build category path from local DB
        var catalogProduct = productRepo.findBySkuCodeAndTenantId(skuCode, tenantId).orElse(null);
        var categoryPath = buildCategoryPath(catalogProduct, tenantId);

        // 5. Find principal image URL
        var principalImageUrl = media.stream()
                .filter(m -> "PRINCIPAL".equals(m.mediaType()))
                .findFirst()
                .map(PimMediaSnapshot::fileUrl)
                .orElse(null);

        // 6. Extract variant labels
        var variantLabels = variants.stream()
                .map(PimVariantSnapshot::label)
                .filter(l -> l != null && !l.isBlank())
                .toList();

        // 7. Build channel list from CatalogProduct
        var channels = catalogProduct != null
                ? catalogProduct.getActiveChannels().stream().map(Enum::name).toList()
                : List.<String>of();

        // 8. Build badge list
        var badges = new ArrayList<String>();
        if (catalogProduct != null && catalogProduct.isBadgeStockLimit()
                && product.totalStock() <= catalogProduct.getStockLimitThreshold()) {
            badges.add("STOCK_LIMITE");
        }
        if (catalogProduct != null && catalogProduct.isFeaturedHomepage()) {
            badges.add("HOMEPAGE_FEATURED");
        }

        // 9. Category name for search
        String categoryNameFr = null;
        String categoryNameAr = null;
        if (catalogProduct != null && catalogProduct.getCategoryId() != null) {
            var cat = categoryRepo.findByIdAndTenantId(catalogProduct.getCategoryId(), tenantId).orElse(null);
            if (cat != null) {
                categoryNameFr = cat.getNameFr();
                categoryNameAr = cat.getNameAr();
            }
        }

        return new CatalogProductIndexDocument(
                skuCode,
                tenantId,
                product.nameFr(),
                product.nameAr(),
                product.descriptionFr(),
                product.descriptionAr(),
                product.brand(),
                pricing != null ? pricing.priceTtc() : BigDecimal.ZERO,
                product.totalStock(),
                principalImageUrl,
                product.returnRate(),
                categoryPath,
                categoryNameFr,
                categoryNameAr,
                channels,
                badges,
                catalogProduct != null ? catalogProduct.getVisibilityScore() : BigDecimal.ZERO,
                null,                   // topSearchPosition — populated by analytics
                Instant.now(),          // publishedAt — approximate
                seo != null ? seo.keywords() : List.of(),
                variantLabels,
                wilayas,
                Instant.now()
        );
    }

    /**
     * Build the category path hierarchy: ["Electronique", "Smartphones", "Acc. iPhone"]
     */
    private List<String> buildCategoryPath(
            com.dz.erp.catalog.product.domain.model.CatalogProduct product, String tenantId) {
        if (product == null || product.getCategoryId() == null) {
            return List.of();
        }

        var path = new ArrayList<String>();
        var catOpt = categoryRepo.findByIdAndTenantId(product.getCategoryId(), tenantId);

        while (catOpt.isPresent()) {
            var cat = catOpt.get();
            path.addFirst(cat.getNameFr()); // prepend — root first
            if (cat.getParentId() == null) break;
            catOpt = categoryRepo.findByIdAndTenantId(cat.getParentId(), tenantId);
        }

        return path;
    }

    // ── Resilient fetch helpers ──

    private <T> T safeFetch(java.util.function.Supplier<T> supplier, String label, String skuCode) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("OpenSearch: {} fetch failed for {} — {}", label, skuCode, e.getMessage());
            return null;
        }
    }

    private <T> List<T> safeFetchList(java.util.function.Supplier<List<T>> supplier,
                                      String label, String skuCode) {
        try {
            var result = supplier.get();
            return result != null ? result : List.of();
        } catch (Exception e) {
            log.warn("OpenSearch: {} fetch failed for {} — {}", label, skuCode, e.getMessage());
            return List.of();
        }
    }
}
