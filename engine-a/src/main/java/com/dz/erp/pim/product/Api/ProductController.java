package com.dz.erp.pim.product.Api;

import com.dz.erp.pim.product.application.ProductService;
import com.dz.erp.pim.product.application.dto.*;
import com.dz.erp.pim.product.domain.model.ProductStatus;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pim/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<ProductResponse> create(@Valid @RequestBody CreateProductCommand cmd) {
        return ApiResult.ok(svc.create(cmd), "product.created");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<ProductResponse> update(@PathVariable String id, @Valid @RequestBody UpdateProductCommand cmd) {
        return ApiResult.ok(svc.update(id, cmd), "product.updated");
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<ProductResponse> activate(@PathVariable String id) {
        return ApiResult.ok(svc.activate(id), "product.activated");
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<ProductResponse> deactivate(@PathVariable String id) {
        return ApiResult.ok(svc.deactivate(id), "product.deactivated");
    }

    @PatchMapping("/{id}/discontinue")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<ProductResponse> discontinue(@PathVariable String id) {
        return ApiResult.ok(svc.discontinue(id), "product.discontinued");
    }

    // OCR endpoints
    @PostMapping("/ocr")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.PROCUREMENT_MANAGER + "')")
    public ApiResult<ProductResponse> createFromOcr(@Valid @RequestBody CreateFromOcrCommand cmd) {
        return ApiResult.ok(svc.createFromOcr(cmd), "product.created");
    }


    // Performance (internal APIs)
    @PatchMapping("/{skuCode}/sales-stats")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.OMS_SERVICE + "')")
    public ApiResult<ProductResponse> updateSalesStats(@PathVariable String skuCode, @RequestBody UpdateSalesStatsCommand cmd) {
        return ApiResult.ok(svc.updateSalesStats(skuCode, cmd));
    }

    @PatchMapping("/return-rate/{skuCode}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.OMS_SERVICE + "')")
    public ApiResult<Void> updateReturnRate(@PathVariable String skuCode, @RequestBody UpdateReturnRateCommand cmd) {
        svc.updateReturnRate(skuCode, cmd);
        return ApiResult.ok(null);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<ProductResponse> getOne(@PathVariable String id) {
        return ApiResult.ok(svc.getById(id));
    }

    @GetMapping("/{skuCode}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<ProductResponse> getsOneBySkuCode(@PathVariable String skuCode) {
        return ApiResult.ok(svc.getBySku(skuCode));
    }

    @GetMapping("/{id}/full")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<ProductWithVariantsResponse> getFull(@PathVariable String id) {
        return ApiResult.ok(svc.getWithVariants(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<ProductResponse>> search(
            @RequestParam(required = false) String search, @RequestParam(required = false) String category,
            @RequestParam(required = false) ProductStatus status, @RequestParam(required = false) String supplier,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(new ProductSearchQuery(search, category, status, supplier, page, size)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<ProductStatsResponse> stats() {
        return ApiResult.ok(svc.getStats());
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<Void> delete(@PathVariable String productId) {
        svc.deleteProduct(productId);
        return ApiResult.ok(null, "product.deleted");
    }
}
