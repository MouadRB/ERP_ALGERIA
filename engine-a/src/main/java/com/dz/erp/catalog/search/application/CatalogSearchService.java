package com.dz.erp.catalog.search.application;

import com.dz.erp.catalog.search.application.dto.SearchQueryCommand;
import com.dz.erp.catalog.search.application.dto.SearchResultResponse;
import com.dz.erp.catalog.search.application.dto.SearchSuggestResponse;
import com.dz.erp.catalog.search.domain.port.SearchIndexPort;
import com.dz.erp.catalog.search.shared.port.CatalogCachePort;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Application service for storefront search and autocomplete.
 *
 * Results are cached in Redis (TTL 5 min for search, 10 min for suggest).
 * Cache is evicted on every product publication/masking event.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogSearchService {

    private final SearchIndexPort searchIndexPort;
    private final CatalogCachePort cachePort;

    /**
     * Full-text search with filters and pagination.
     * Cached by query hash (TTL 5 min).
     */
    public SearchResultResponse search(SearchQueryCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var cacheKey = "catalog:search:" + hashQuery(cmd, tenantId);

        // Try cache first
        var cached = cachePort.get(cacheKey, SearchResultResponse.class);
        if (cached.isPresent()) {
            log.debug("Search cache hit for query '{}'", cmd.query());
            return cached.get();
        }

        // Cache miss → search OpenSearch
        var filters = buildFilters(cmd);
        var result = searchIndexPort.search(cmd.query(), filters, tenantId, cmd.page(), cmd.size());

        var response = new SearchResultResponse(
                result.hits().stream()
                        .map(h -> new SearchResultResponse.ProductHit(
                                h.skuCode(), h.nameFr(), h.nameAr(),
                                h.principalImageUrl(), h.priceTtc(),
                                h.stockDisponible(), h.badges(), h.score()))
                        .toList(),
                result.totalHits(),
                result.tookMs(),
                cmd.page(),
                cmd.size()
        );

        // Fill cache
        cachePort.put(cacheKey, response, Duration.ofMinutes(5));

        return response;
    }

    /**
     * Autocomplete suggestions from the search bar.
     * Cached by prefix (TTL 10 min).
     */
    public SearchSuggestResponse suggest(String prefix) {
        var tenantId = AuthContext.currentTenantId();
        var cacheKey = "catalog:suggest:" + prefix.toLowerCase() + ":" + tenantId;

        var cached = cachePort.get(cacheKey, SearchSuggestResponse.class);
        if (cached.isPresent()) {
            return cached.get();
        }

        var suggestions = searchIndexPort.suggest(prefix, tenantId, 8);
        var response = new SearchSuggestResponse(suggestions);

        cachePort.put(cacheKey, response, Duration.ofMinutes(10));

        return response;
    }

    // ──────────────────────────────────────────────

    private Map<String, String> buildFilters(SearchQueryCommand cmd) {
        var filters = new java.util.HashMap<String, String>();
        if (cmd.category() != null && !cmd.category().isBlank()) {
            filters.put("categoryNameFr", cmd.category());
        }
        if (cmd.channel() != null && !cmd.channel().isBlank()) {
            filters.put("channels", cmd.channel());
        }
        return filters;
    }

    private String hashQuery(SearchQueryCommand cmd, String tenantId) {
        return Integer.toHexString(
                java.util.Objects.hash(
                        cmd.query(), cmd.category(), cmd.channel(),
                        cmd.page(), cmd.size(), tenantId));
    }
}
