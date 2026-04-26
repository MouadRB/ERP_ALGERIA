package com.dz.erp.catalog.search.infrastructure.client;

import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;
import com.dz.erp.catalog.search.domain.port.SearchIndexPort;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.MultiMatchQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch._types.query_dsl.TermQuery;
import org.opensearch.client.opensearch.core.*;
import org.opensearch.client.opensearch.core.bulk.BulkOperation;
import org.opensearch.client.opensearch.core.bulk.IndexOperation;
import org.opensearch.client.opensearch.core.search.Hit;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Infrastructure adapter — implements SearchIndexPort using opensearch-java 2.x client.
 *
 * Index naming convention: {prefix}_{tenantId} → e.g. "ferza_products_tenant01"
 * Each tenant has its own index for complete data isolation.
 */
@Slf4j
@Component
public class OpenSearchClientAdapter implements SearchIndexPort {

    private final OpenSearchClient client;
    private final String indexPrefix;

    public OpenSearchClientAdapter(OpenSearchClient client,
                                   @Qualifier("openSearchIndexPrefix") String indexPrefix) {
        this.client = client;
        this.indexPrefix = indexPrefix;
    }

    // ──────────────────────────────────────────────
    // Write operations
    // ──────────────────────────────────────────────

    @Override
    public void indexProduct(CatalogProductIndexDocument doc) {
        var indexName = resolveIndex(doc.tenantId());
        try {
            client.index(r -> r
                    .index(indexName)
                    .id(doc.skuCode())
                    .document(doc));
            log.debug("OpenSearch: indexed {} in {}", doc.skuCode(), indexName);
        } catch (IOException e) {
            log.error("OpenSearch: failed to index {} — {}", doc.skuCode(), e.getMessage(), e);
            throw new RuntimeException("OpenSearch index failed for " + doc.skuCode(), e);
        }
    }

    @Override
    public void removeProduct(String skuCode, String tenantId) {
        var indexName = resolveIndex(tenantId);
        try {
            client.delete(r -> r.index(indexName).id(skuCode));
            log.debug("OpenSearch: removed {} from {}", skuCode, indexName);
        } catch (IOException e) {
            // 404 is expected if the product was never indexed — log and ignore
            if (e.getMessage() != null && e.getMessage().contains("404")) {
                log.debug("OpenSearch: {} not found in index (already removed or never indexed)", skuCode);
            } else {
                log.error("OpenSearch: failed to remove {} — {}", skuCode, e.getMessage(), e);
            }
        }
    }

    @Override
    public void bulkIndex(List<CatalogProductIndexDocument> docs) {
        if (docs.isEmpty()) return;

        var tenantId = docs.getFirst().tenantId();
        var indexName = resolveIndex(tenantId);

        var operations = docs.stream()
                .map(doc -> BulkOperation.of(op -> op
                        .index(IndexOperation.of(idx -> idx
                                .index(indexName)
                                .id(doc.skuCode())
                                .document(doc)))))
                .toList();

        try {
            var response = client.bulk(r -> r.operations(operations));
            if (response.errors()) {
                long errorCount = response.items().stream()
                        .filter(item -> item.error() != null)
                        .count();
                log.warn("OpenSearch: bulk index completed with {} errors out of {} docs",
                        errorCount, docs.size());
            } else {
                log.info("OpenSearch: bulk indexed {} documents in {}", docs.size(), indexName);
            }
        } catch (IOException e) {
            log.error("OpenSearch: bulk index failed — {}", e.getMessage(), e);
            throw new RuntimeException("OpenSearch bulk index failed", e);
        }
    }

    // ──────────────────────────────────────────────
    // Read operations
    // ──────────────────────────────────────────────

    @Override
    public SearchResult search(String query, Map<String, String> filters,
                               String tenantId, int page, int size) {
        var indexName = resolveIndex(tenantId);

        try {
            // Multi-match on nameFr, nameAr, keywords with French/Arabic analyzer
            var multiMatch = MultiMatchQuery.of(mm -> mm
                    .query(query)
                    .fields("nameFr^3", "nameAr^3", "descriptionFr", "descriptionAr",
                            "keywords^2", "brand", "categoryNameFr", "categoryNameAr")
                    .fuzziness("AUTO"));

            var boolBuilder = new BoolQuery.Builder()
                    .must(Query.of(q -> q.multiMatch(multiMatch)));

            // Apply filters (category, channel, price range, etc.)
            for (var entry : filters.entrySet()) {
                var field = entry.getKey();
                var value = entry.getValue();
                boolBuilder.filter(Query.of(q -> q
                        .term(TermQuery.of(t -> t
                                .field(field)
                                .value(FieldValue.of(value))))));
            }

            var response = client.search(s -> s
                            .index(indexName)
                            .query(Query.of(q -> q.bool(boolBuilder.build())))
                            .from(page * size)
                            .size(size),
                    CatalogProductIndexDocument.class);

            var hits = response.hits().hits().stream()
                    .map(this::toSearchHit)
                    .toList();

            var totalHits = response.hits().total() != null
                    ? response.hits().total().value() : 0L;

            return new SearchResult(hits, totalHits, response.took());

        } catch (IOException e) {
            log.error("OpenSearch: search failed for query '{}' — {}", query, e.getMessage(), e);
            return new SearchResult(List.of(), 0, 0);
        }
    }

    @Override
    public List<String> suggest(String prefix, String tenantId, int maxResults) {
        var indexName = resolveIndex(tenantId);

        try {
            // Prefix query on nameFr for autocomplete
            var response = client.search(s -> s
                            .index(indexName)
                            .query(Query.of(q -> q
                                    .prefix(p -> p
                                            .field("nameFr")
                                            .value(prefix.toLowerCase()))))
                            .size(maxResults)
                            .source(sc -> sc.filter(f -> f.includes("nameFr"))),
                    CatalogProductIndexDocument.class);

            return response.hits().hits().stream()
                    .map(hit -> hit.source() != null ? hit.source().nameFr() : "")
                    .filter(name -> name != null && !name.isBlank())
                    .distinct()
                    .toList();

        } catch (IOException e) {
            log.error("OpenSearch: suggest failed for prefix '{}' — {}", prefix, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    public IndexStatus getStatus(String tenantId) {
        var indexName = resolveIndex(tenantId);

        try {
            // Cluster health
            var health = client.cluster().health();

            // Index stats
            var stats = client.indices().stats(r -> r.index(indexName));
            var primaries = stats.indices().get(indexName);

            long docCount = primaries != null && primaries.primaries() != null
                    && primaries.primaries().docs() != null
                    ? primaries.primaries().docs().count() : 0;

            // Average search latency from stats
            long searchTotal = primaries != null && primaries.primaries() != null
                    && primaries.primaries().search() != null
                    ? primaries.primaries().search().queryTimeInMillis() : 0;
            long searchCount = primaries != null && primaries.primaries() != null
                    && primaries.primaries().search() != null
                    ? primaries.primaries().search().queryTotal() : 1;
            long avgLatency = searchCount > 0 ? searchTotal / searchCount : 0;

            return new IndexStatus(
                    health.status().jsonValue(),
                    docCount,
                    avgLatency,
                    "live",       // computed from last indexed document timestamp in caller
                    0.87          // aggregated from search relevance — placeholder
            );

        } catch (IOException e) {
            log.error("OpenSearch: health check failed — {}", e.getMessage(), e);
            return new IndexStatus("red", 0, 0, "unavailable", 0.0);
        }
    }

    // ──────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────

    private String resolveIndex(String tenantId) {
        return indexPrefix + "_" + tenantId;
    }

    private SearchHit toSearchHit(Hit<CatalogProductIndexDocument> hit) {
        var doc = hit.source();
        if (doc == null) {
            return new SearchHit("", "", "", "", "", 0, List.of(), hit.score());
        }
        return new SearchHit(
                doc.skuCode(),
                doc.nameFr(),
                doc.nameAr(),
                doc.principalImageUrl(),
                doc.priceTtc() != null ? doc.priceTtc().toPlainString() : "0",
                doc.stockDisponible(),
                doc.badges() != null ? doc.badges() : List.of(),
                hit.score()
        );
    }
}
