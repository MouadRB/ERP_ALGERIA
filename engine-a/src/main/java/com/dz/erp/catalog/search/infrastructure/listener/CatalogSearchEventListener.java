package com.dz.erp.catalog.search.infrastructure.listener;

import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.catalog.search.application.CatalogSearchIndexer;
import com.dz.erp.catalog.search.shared.port.CatalogCachePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Infrastructure event listener — reacts to CatalogProduct domain events
 * and triggers OpenSearch index operations.
 *
 * Also evicts search/suggest Redis caches so the storefront sees fresh results.
 *
 * This is an infrastructure component (not application) because @EventListener
 * is a Spring annotation — the application layer stays framework-free.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogSearchEventListener {

    private final CatalogSearchIndexer indexer;
    private final CatalogCachePort cachePort;

    // ── Index on publish ──

    @EventListener
    public void onPublished(CatalogDomainEvent.ProductPublished e) {
        log.debug("Search event: ProductPublished {} — indexing", e.skuCode());
        indexer.indexProduct(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    // ── Remove from index on mask/discontinue ──

    @EventListener
    public void onMaskedAuto(CatalogDomainEvent.ProductMaskedAuto e) {
        log.debug("Search event: ProductMaskedAuto {} reason={} — removing", e.skuCode(), e.reason());
        indexer.removeFromIndex(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    @EventListener
    public void onMaskedManual(CatalogDomainEvent.ProductMaskedManual e) {
        log.debug("Search event: ProductMaskedManual {} — removing", e.skuCode());
        indexer.removeFromIndex(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    @EventListener
    public void onDiscontinued(CatalogDomainEvent.ProductDiscontinuedInCatalog e) {
        log.debug("Search event: ProductDiscontinued {} — removing permanently", e.skuCode());
        indexer.removeFromIndex(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    // ── Re-index on channel/category/rule changes ──

    @EventListener
    public void onChannelChanged(CatalogDomainEvent.ChannelChanged e) {
        log.debug("Search event: ChannelChanged {} channel={} — re-indexing", e.skuCode(), e.channel());
        indexer.indexProduct(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    @EventListener
    public void onCategoryAssigned(CatalogDomainEvent.CategoryAssigned e) {
        log.debug("Search event: CategoryAssigned {} — re-indexing with category path", e.skuCode());
        indexer.indexProduct(e.skuCode(), e.tenantId());
        evictSearchCaches();
    }

    @EventListener
    public void onRuleToggled(CatalogDomainEvent.RuleToggled e) {
        log.debug("Search event: RuleToggled {} rule={} — re-indexing badges", e.skuCode(), e.rule());
        indexer.indexProduct(e.skuCode(), e.tenantId());
        // No search cache eviction needed — badges don't affect search ranking
    }

    // ──────────────────────────────────────────────
    // Cache eviction
    // ──────────────────────────────────────────────

    /**
     * Evict all search and suggest caches.
     * Called on every publication/masking event to ensure storefront shows fresh results.
     */
    private void evictSearchCaches() {
        cachePort.evictByPattern("catalog:search:*");
        cachePort.evictByPattern("catalog:suggest:*");
    }
}
