package com.dz.erp.catalog.search.infrastructure.web;

import com.dz.erp.catalog.search.application.CatalogSearchIndexer;
import com.dz.erp.catalog.search.application.CatalogSearchService;
import com.dz.erp.catalog.search.application.dto.SearchQueryCommand;
import com.dz.erp.catalog.search.application.dto.SearchResultResponse;
import com.dz.erp.catalog.search.application.dto.SearchSuggestResponse;
import com.dz.erp.catalog.search.domain.port.SearchIndexPort;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.AuthContext;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for storefront search and OpenSearch management.
 *
 * GET  /catalog/v1/search?q=...&category=...&page=0&size=25   → full-text search
 * GET  /catalog/v1/search/suggest?q=nik                        → autocomplete
 * GET  /catalog/v1/search/index-status                         → OpenSearch health
 * POST /catalog/v1/search/reindex                              → force full re-indexation
 *
 * Also aliased under /catalog/v1/opensearch/* for backward compatibility.
 */
@RestController
@RequiredArgsConstructor
public class SearchController {

    private final CatalogSearchService searchService;
    private final CatalogSearchIndexer indexer;

    // ──────────────────────────────────────────────
    // Storefront search endpoints
    // ──────────────────────────────────────────────

    /**
     * Full-text search with filters.
     * GET /catalog/v1/search?q=nike+air+max&category=chaussures&page=0&size=25
     */
    @GetMapping("/catalog/v1/search")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.SALES_MANAGER + "','" + Roles.CS_AGENT + "','" + Roles.CRM_AGENT + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SearchResultResponse> search(
            @RequestParam("q") String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "channel", required = false) String channel,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "25") int size) {

        var cmd = new SearchQueryCommand(query, category, channel, page, size);
        return ApiResult.ok(searchService.search(cmd));
    }

    /**
     * Autocomplete suggestions for the search bar.
     * GET /catalog/v1/search/suggest?q=nik
     */
    @GetMapping("/catalog/v1/search/suggest")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.SALES_MANAGER + "','" + Roles.CS_AGENT + "','" + Roles.CRM_AGENT + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SearchSuggestResponse> suggest(
            @RequestParam("q") String prefix) {
        return ApiResult.ok(searchService.suggest(prefix));
    }

    // ──────────────────────────────────────────────
    // OpenSearch management endpoints
    // ──────────────────────────────────────────────

    /**
     * Get OpenSearch cluster health + index stats.
     * GET /catalog/v1/search/index-status
     * GET /catalog/v1/opensearch/status  (backward-compatible alias)
     */
    @GetMapping({"/catalog/v1/search/index-status", "/catalog/v1/opensearch/status"})
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SearchIndexPort.IndexStatus> indexStatus() {
        return ApiResult.ok(indexer.getIndexHealth(AuthContext.currentTenantId()));

    }

    /**
     * Force full re-indexation of all PUBLISHED products.
     * Runs async — returns immediately.
     *
     * POST /catalog/v1/search/reindex
     * POST /catalog/v1/opensearch/reindex  (backward-compatible alias)
     */
    @PostMapping({"/catalog/v1/search/reindex", "/catalog/v1/opensearch/reindex"})
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<Void> reindex() {
        indexer.reindexAll(AuthContext.currentTenantId());
        return ApiResult.ok(null, "opensearch.reindex.triggered");
    }
}
