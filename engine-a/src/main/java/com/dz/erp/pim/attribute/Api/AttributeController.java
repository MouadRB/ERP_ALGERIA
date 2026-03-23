package com.dz.erp.pim.attribute.Api;

import com.dz.erp.pim.attribute.application.AttributeService;
import com.dz.erp.pim.attribute.application.dto.AttributeResponse;
import com.dz.erp.pim.attribute.application.dto.SetAttributeCommand;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products/{productId}/attributes")
@RequiredArgsConstructor
public class AttributeController {
    private final AttributeService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<AttributeResponse> add(@PathVariable String productId, @Valid @RequestBody SetAttributeCommand cmd) {
        return ApiResult.ok(svc.add(productId, cmd), "attribute.added");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<AttributeResponse>> list(@PathVariable String productId) {
        return ApiResult.ok(svc.list(productId));
    }

    @DeleteMapping("/{attributeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<Void> delete(@PathVariable String productId, @PathVariable String attributeId) {
        svc.delete(attributeId);
        return ApiResult.ok(null, "attribute.deleted");
    }
}
