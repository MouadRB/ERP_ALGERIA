package com.dz.erp.inventory.alert.Api;

import com.dz.erp.inventory.alert.application.dto.StockAlertResponse;
import com.dz.erp.inventory.alert.application.service.StockAlertService;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
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
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.LOGISTICS_AGENT + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<StockAlertResponse>> getActiveAlerts() {
        return ApiResult.ok(svc.getActiveAlerts(), "alert.list");
    }

    @GetMapping("/reorder-suggestions")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<StockAlertResponse>> getReorderSuggestions() {
        return ApiResult.ok(svc.getReorderSuggestions(), "alert.reorder.suggestions");
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "')")
    public ApiResult<StockAlertResponse> resolve(@PathVariable String id) {
        return ApiResult.ok(svc.resolve(id), "alert.resolved");
    }
}
