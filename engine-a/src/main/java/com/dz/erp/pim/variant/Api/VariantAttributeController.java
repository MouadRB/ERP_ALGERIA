package com.dz.erp.pim.variant.Api;

import com.dz.erp.pim.variant.application.VariantAttributeService;
import com.dz.erp.pim.variant.application.dto.SetVariantAttributeCommand;
import com.dz.erp.pim.variant.application.dto.VariantAttributeResponse;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/variants/{variantId}/attributes")
@RequiredArgsConstructor
public class VariantAttributeController {

    private final VariantAttributeService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<VariantAttributeResponse> add(@PathVariable String productId,
                                                   @PathVariable String variantId,
                                                   @Valid @RequestBody SetVariantAttributeCommand cmd) {
        return ApiResult.ok(svc.add(variantId, cmd), "variant.attribute.added");
    }

    @PutMapping("/{attributeId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<VariantAttributeResponse> update(@PathVariable String productId,
                                                      @PathVariable String variantId,
                                                      @PathVariable String attributeId,
                                                      @Valid @RequestBody SetVariantAttributeCommand cmd) {
        return ApiResult.ok(svc.update(attributeId, cmd), "variant.attribute.updated");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<VariantAttributeResponse>> list(@PathVariable String productId,
                                                          @PathVariable String variantId) {
        return ApiResult.ok(svc.listByVariant(variantId));
    }

    @DeleteMapping("/{attributeId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<Void> delete(@PathVariable String productId,
                                  @PathVariable String variantId,
                                  @PathVariable String attributeId) {
        svc.delete(attributeId);
        return ApiResult.ok(null, "variant.attribute.deleted");
    }
}
