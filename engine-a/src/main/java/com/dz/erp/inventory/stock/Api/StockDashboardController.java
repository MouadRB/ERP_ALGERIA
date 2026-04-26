package com.dz.erp.inventory.stock.Api;

import com.dz.erp.inventory.stock.application.dto.StockDashboardResponse;
import com.dz.erp.inventory.stock.application.service.StockDashboardService;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/inventory/v1/dashboard")
@RequiredArgsConstructor
public class StockDashboardController {
    private final StockDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.LOGISTICS_AGENT + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<StockDashboardResponse> getDashboard() {
        return ApiResult.ok(dashboardService.getDashboard(), "dashboard.loaded");
    }
}
