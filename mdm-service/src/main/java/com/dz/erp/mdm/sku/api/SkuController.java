package com.dz.erp.mdm.sku.api;

import com.dz.erp.mdm.sku.application.SkuService;
import com.dz.erp.mdm.sku.application.dto.*;
import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mdm/v1/skus")
@RequiredArgsConstructor
public class SkuController {
    private final SkuService skuService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<SkuResponse> register(@Valid @RequestBody RegisterSkuCommand cmd) {
        return ApiResult.ok(skuService.register(cmd), "sku.created");
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<SkuResponse> update(@PathVariable String code, @Valid @RequestBody UpdateSkuCommand cmd) {
        return ApiResult.ok(skuService.update(code, cmd), "sku.updated");
    }

    @PatchMapping("/{code}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','INVENTORY_MANAGER')")
    public ApiResult<SkuResponse> activate(@PathVariable String code) {
        return ApiResult.ok(skuService.activate(code), "sku.activated");
    }

    @PatchMapping("/{code}/discontinue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER')")
    public ApiResult<SkuResponse> discontinue(@PathVariable String code) {
        return ApiResult.ok(skuService.discontinue(code), "sku.discontinued");
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    public ApiResult<SkuResponse> getOne(@PathVariable String code) {
        return ApiResult.ok(skuService.getByCode(code));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    public ApiResult<List<SkuResponse>> search(@RequestParam(required = false) String search,
                                               @RequestParam(required = false) SkuStatus status,
                                               @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(skuService.search(new SkuSearchQuery(search, status, page, size)));
    }
}
