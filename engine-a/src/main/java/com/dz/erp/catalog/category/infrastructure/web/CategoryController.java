package com.dz.erp.catalog.category.infrastructure.web;

import com.dz.erp.catalog.category.application.CategoryService;
import com.dz.erp.catalog.category.application.dto.*;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    /**
     * GET /catalog/v1/categories — returns hierarchical tree (cached in Redis).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<CategoryTreeResponse>> getTree() {
        return ApiResult.ok(service.getCategoryTree());
    }

    /**
     * GET /catalog/v1/categories/{code} — returns single category with stats.
     */
    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "','"
            + Roles.INVENTORY_MANAGER + "','" + Roles.FINANCE_MANAGER + "','"
            + Roles.REPORTING_ANALYST + "')")
    public ApiResult<CategoryResponse> getByCode(@PathVariable String code) {
        return ApiResult.ok(service.getCategoryWithStats(code));
    }

    /**
     * POST /catalog/v1/categories — create a new category.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CategoryResponse> create(@Valid @RequestBody CreateCategoryCommand cmd) {
        return ApiResult.ok(service.createCategory(cmd), "category.created");
    }

    /**
     * PUT /catalog/v1/categories/{code} — update an existing category.
     */
    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<CategoryResponse> update(@PathVariable String code,
                                               @Valid @RequestBody UpdateCategoryCommand cmd) {
        return ApiResult.ok(service.updateCategory(code, cmd), "category.updated");
    }

    /**
     * DELETE /catalog/v1/categories/{code} — delete if no products assigned.
     */
    @DeleteMapping("/{code}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.PRODUCT_MANAGER + "')")
    public ApiResult<Void> delete(@PathVariable String code) {
        service.deleteCategory(code);
        return ApiResult.ok(null, "category.deleted");
    }
}
