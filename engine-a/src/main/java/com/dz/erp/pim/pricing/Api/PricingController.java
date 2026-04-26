package com.dz.erp.pim.pricing.Api;

import com.dz.erp.pim.pricing.application.PricingService;
import com.dz.erp.pim.pricing.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.AuthContext;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/pricing")
@RequiredArgsConstructor
public class PricingController {
    private final PricingService svc;

    @PutMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<PriceResponse> setPrice(@PathVariable String productId, @Valid @RequestBody SetPriceCommand cmd) {
        return ApiResult.ok(svc.setPrice(productId, cmd), "price.updated");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<PriceResponse> getPrice(@PathVariable String productId) {
        return ApiResult.ok(svc.getPrice(productId));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.FINANCE_MANAGER + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<PriceHistoryResponse>> history(@PathVariable String productId) {
        return ApiResult.ok(svc.getHistory(productId));
    }

    @PatchMapping("/pim/v1/products/cost/{skuCode}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PROCUREMENT_MANAGER + "')")
    public ApiResult<Void> updateCost(@PathVariable String skuCode, @Valid @RequestBody UpdateCostCommand cmd) {
        svc.updateCostFromProcurement(skuCode, AuthContext.currentTenantId(),
                cmd.fifoCost(), cmd.weightedAvgCost(), cmd.purchaseOrderRef());
        return ApiResult.ok(null, "cost.updated");
    }
}
