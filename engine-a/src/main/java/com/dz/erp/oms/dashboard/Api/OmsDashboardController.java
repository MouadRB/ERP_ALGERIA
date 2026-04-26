package com.dz.erp.oms.dashboard.Api;

import com.dz.erp.oms.common.OmsRoles;
import com.dz.erp.oms.dashboard.application.OmsDashboardService;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse;
import com.dz.erp.shared.api.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * COD operator dashboard payload — KPIs, confirmation queue, COD funnel, risk.
 *
 * <p>Consumed directly by engine-b's {@code DashboardController} via an HTTP client.
 * One round-trip returns everything the dashboard needs; engine-b stops maintaining
 * its own order replica for read paths.
 */
@RestController
@RequestMapping("/oms/v1/dashboard")
@RequiredArgsConstructor
public class OmsDashboardController {

    private final OmsDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.SALES_MANAGER + "','"
            + OmsRoles.CS_AGENT + "','" + OmsRoles.REPORTING_ANALYST + "')")
    public ApiResult<OmsDashboardResponse> getDashboard() {
        return ApiResult.ok(dashboardService.getDashboard(), "oms.dashboard.loaded");
    }
}
