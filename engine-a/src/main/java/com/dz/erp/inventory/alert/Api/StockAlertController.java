package com.dz.erp.inventory.alert.Api;

import com.dz.erp.inventory.alert.application.dto.StockAlertResponse;
import com.dz.erp.inventory.alert.application.service.StockAlertService;
import com.dz.erp.shared.api.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/v1/alerts")
@RequiredArgsConstructor
public class StockAlertController {
    private final StockAlertService svc;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<List<StockAlertResponse>> getActiveAlerts() {
        return ApiResult.ok(svc.getActiveAlerts(), "alert.list");
    }

    @GetMapping("/reorder-suggestions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER','PROCUREMENT_MANAGER')")
    public ApiResult<List<StockAlertResponse>> getReorderSuggestions() {
        return ApiResult.ok(svc.getReorderSuggestions(), "alert.reorder.suggestions");
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<StockAlertResponse> resolve(@PathVariable String id) {
        return ApiResult.ok(svc.resolve(id), "alert.resolved");
    }
}
