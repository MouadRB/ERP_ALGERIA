package com.dz.erp.catalog.search.domain.port;

import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;

import java.util.List;
import java.util.Map;

/**
 * Domain port for OpenSearch operations.
 * No Spring, no OpenSearch imports — implemented by OpenSearchClientAdapter.
 */
public interface SearchIndexPort {

    /** Index a single product document. Upsert semantics — creates or replaces. */
    void indexProduct(CatalogProductIndexDocument doc);

    /** Remove a product from the index. Idempotent — ignores 404 (product may not have been indexed). */
    void removeProduct(String skuCode, String tenantId);

    /** Bulk-index multiple documents in a single request. */
    void bulkIndex(List<CatalogProductIndexDocument> docs);

    /** Full-text search with filters. Returns paginated results. */
    SearchResult search(String query, Map<String, String> filters, String tenantId, int page, int size);

    /** Autocomplete/suggest for the search bar. Returns top-N prefix matches. */
    List<String> suggest(String prefix, String tenantId, int maxResults);

    /** Cluster health + index stats. */
    IndexStatus getStatus(String tenantId);

    // ── Result types ──

    record SearchResult(
            List<SearchHit> hits,
            long totalHits,
            long tookMs
    ) {}

    record SearchHit(
            String skuCode,
            String nameFr,
            String nameAr,
            String principalImageUrl,
            String priceTtc,
            int stockDisponible,
            List<String> badges,
            double score
    ) {}

    record IndexStatus(
            String clusterStatus,       // "green", "yellow", "red"
            long documentCount,
            long averageLatencyMs,
            String lastIndexedAgo,
            double relevanceScore
    ) {}
}
