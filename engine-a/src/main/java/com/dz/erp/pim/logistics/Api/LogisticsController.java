package com.dz.erp.pim.logistics.Api;

import com.dz.erp.pim.logistics.application.LogisticsService;
import com.dz.erp.pim.logistics.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService svc;

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.LOGISTICS_AGENT + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<LogisticsResponse> get(@PathVariable String productId) {
        return ApiResult.ok(svc.getLogistics(productId));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "')")
    public ApiResult<LogisticsResponse> update(@PathVariable String productId,
                                               @RequestBody UpdateLogisticsCommand cmd) {
        return ApiResult.ok(svc.updateLogistics(productId, cmd), "logistics.updated");
    }

    @GetMapping("/restrictions")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.LOGISTICS_AGENT + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<WilayaRestrictionResponse>> listRestrictions(@PathVariable String productId) {
        return ApiResult.ok(svc.getRestrictions(productId));
    }

    @PostMapping("/restrictions")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "')")
    public ApiResult<LogisticsResponse> addRestriction(@PathVariable String productId,
                                                       @Valid @RequestBody AddWilayaRestrictionCommand cmd) {
        return ApiResult.ok(svc.addRestriction(productId, cmd), "restriction.added");
    }

    @DeleteMapping("/restrictions/{wilayaCode}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "')")
    public ApiResult<Void> removeRestriction(@PathVariable String productId,
                                             @PathVariable String wilayaCode) {
        svc.removeRestriction(productId, wilayaCode);
        return ApiResult.ok(null, "restriction.removed");
    }
}
