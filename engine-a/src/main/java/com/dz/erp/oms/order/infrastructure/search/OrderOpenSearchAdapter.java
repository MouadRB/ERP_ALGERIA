package com.dz.erp.oms.order.infrastructure.search;

import com.dz.erp.oms.order.domain.port.OrderSearchPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.indices.CreateIndexRequest;
import org.opensearch.client.opensearch.indices.ExistsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Stage 11 — OpenSearch implementation of {@link OrderSearchPort}.
 *
 * <p>Index creation is best-effort on startup: if the index is missing we create it
 * with a minimal default mapping; if creation fails we log and move on — the cluster
 * may already have a template that governs mappings.
 */
@Slf4j
@Component
@ConditionalOnBean(OpenSearchClient.class)
public class OrderOpenSearchAdapter implements OrderSearchPort {

    private final OpenSearchClient client;
    private final String indexName;

    public OrderOpenSearchAdapter(OpenSearchClient client,
                                  @Value("${oms.search.index-name:oms-orders}") String indexName) {
        this.client = client;
        this.indexName = indexName;
    }

    @PostConstruct
    void ensureIndex() {
        try {
            var exists = client.indices().exists(ExistsRequest.of(b -> b.index(indexName))).value();
            if (!exists) {
                client.indices().create(CreateIndexRequest.of(b -> b.index(indexName)));
                log.info("Created OpenSearch index {}", indexName);
            }
        } catch (Exception e) {
            log.warn("Could not ensure OpenSearch index {}: {}", indexName, e.getMessage());
        }
    }

    @Override
    public void upsert(UUID orderId, Map<String, Object> document) {
        try {
            client.index(b -> b.index(indexName).id(orderId.toString()).document(document));
        } catch (Exception e) {
            log.warn("OpenSearch upsert failed for order {}: {}", orderId, e.getMessage());
        }
    }

    @Override
    public void delete(UUID orderId) {
        try {
            client.delete(b -> b.index(indexName).id(orderId.toString()));
        } catch (Exception e) {
            log.warn("OpenSearch delete failed for order {}: {}", orderId, e.getMessage());
        }
    }

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public SearchResult search(String tenantId, String q, Map<String, String> filters, int page, int size) {
        try {
            List<Query> must = new ArrayList<>();
            must.add(Query.of(qb -> qb.term(t -> t.field("tenant_id").value(v -> v.stringValue(tenantId)))));

            if (q != null && !q.isBlank()) {
                must.add(Query.of(qb -> qb.multiMatch(mm -> mm
                        .query(q)
                        .fields("recipient_name^2", "customer_id", "external_order_ref",
                                "commune", "tracking_number"))));
            }
            if (filters != null) {
                for (var entry : filters.entrySet()) {
                    if (entry.getValue() == null || entry.getValue().isBlank()) continue;
                    must.add(Query.of(qb -> qb.term(t -> t.field(entry.getKey())
                            .value(v -> v.stringValue(entry.getValue())))));
                }
            }
            BoolQuery bool = BoolQuery.of(b -> b.must(must));
            SearchRequest req = SearchRequest.of(b -> b
                    .index(indexName)
                    .query(Query.of(qb -> qb.bool(bool)))
                    .from(page * size)
                    .size(size));

            var resp = client.search(req, Map.class);
            var hits = new ArrayList<Map<String, Object>>(resp.hits().hits().size());
            for (var h : resp.hits().hits()) {
                if (h.source() != null) hits.add((Map<String, Object>) h.source());
            }
            long total = resp.hits().total() != null ? resp.hits().total().value() : hits.size();
            return new SearchResult(hits, total);
        } catch (Exception e) {
            log.error("OpenSearch query failed: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.OMS_SEARCH_UNAVAILABLE);
        }
    }
}
