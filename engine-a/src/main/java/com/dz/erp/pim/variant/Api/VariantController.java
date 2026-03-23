package com.dz.erp.pim.variant.Api;

import com.dz.erp.pim.variant.application.VariantService;
import com.dz.erp.pim.variant.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/variants")
@RequiredArgsConstructor
public class VariantController {
    private final VariantService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<VariantResponse> create(@PathVariable String productId, @Valid @RequestBody CreateVariantCommand cmd) {
        return ApiResult.ok(svc.create(productId, cmd), "variant.created");
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<VariantResponse> update(@PathVariable String productId, @PathVariable String variantId, @Valid @RequestBody UpdateVariantCommand cmd) {
        return ApiResult.ok(svc.update(variantId, cmd), "variant.updated");
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<Void> delete(@PathVariable String productId, @PathVariable String variantId) {
        svc.delete(productId, variantId);
        return ApiResult.ok(null, "variant.deleted");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<VariantResponse>> list(@PathVariable String productId) {
        return ApiResult.ok(svc.listByProduct(productId));
    }
}
