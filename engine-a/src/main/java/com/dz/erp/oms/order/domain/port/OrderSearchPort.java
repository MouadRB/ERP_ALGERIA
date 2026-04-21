package com.dz.erp.oms.order.domain.port;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Outbound port for the OMS read-model index. Infrastructure provides an OpenSearch
 * adapter (optional — gated by {@code oms.search.enabled}). When disabled, a no-op
 * implementation is registered so listeners and the search endpoint degrade silently.
 *
 * <p>The adapter layer owns the document shape; the application service passes a
 * plain map so the domain layer never imports OpenSearch types.
 */
public interface OrderSearchPort {

    /** Upsert the given order document keyed by {@code orderId}. */
    void upsert(UUID orderId, Map<String, Object> document);

    /** Delete the document (used on hard deletes — rare; mostly unused today). */
    void delete(UUID orderId);

    /**
     * Full-text + faceted search. {@code q} may be null/blank. {@code filters} are
     * exact-match terms (status, wilaya_code, channel_code, customer_id, ...).
     * Returns the matching documents as flat maps and a total count.
     */
    SearchResult search(String tenantId, String q, Map<String, String> filters, int page, int size);

    record SearchResult(List<Map<String, Object>> hits, long total) {}
}
