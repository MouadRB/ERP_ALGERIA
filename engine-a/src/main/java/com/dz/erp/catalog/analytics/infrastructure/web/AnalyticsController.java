package com.dz.erp.catalog.analytics.infrastructure.web;

import com.dz.erp.catalog.analytics.application.CatalogAnalyticsService;
import com.dz.erp.catalog.analytics.application.dto.CatalogAnalyticsResponse;
import com.dz.erp.shared.api.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/catalog/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final CatalogAnalyticsService svc;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER','FINANCE_MANAGER')")
    public ApiResult<CatalogAnalyticsResponse> get(@RequestParam(defaultValue = "7") int days) {
        return ApiResult.ok(svc.getAnalytics());
    }
}
