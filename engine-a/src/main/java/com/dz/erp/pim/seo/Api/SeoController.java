package com.dz.erp.pim.seo.Api;

import com.dz.erp.pim.seo.application.SeoService;
import com.dz.erp.pim.seo.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pim/v1/products/{productId}/seo")
@RequiredArgsConstructor
public class SeoController {
    private final SeoService svc;

    @PutMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<SeoResponse> update(@PathVariable String productId, @RequestBody UpdateSeoCommand cmd) {
        return ApiResult.ok(svc.update(productId, cmd), "seo.updated");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<SeoResponse> get(@PathVariable String productId) {
        return ApiResult.ok(svc.getSeo(productId));
    }
}
