package com.dz.erp.mdm.supplier.api;

import com.dz.erp.mdm.supplier.application.SupplierService;
import com.dz.erp.mdm.supplier.application.dto.*;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mdm/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> register(@Valid @RequestBody RegisterSupplierCommand cmd) {
        return ApiResult.ok(svc.register(cmd), "supplier.created");
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> update(@PathVariable String code, @Valid @RequestBody UpdateSupplierCommand cmd) {
        return ApiResult.ok(svc.update(code, cmd), "supplier.updated");
    }

    @PatchMapping("/{code}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> activate(@PathVariable String code) {
        return ApiResult.ok(svc.activate(code), "supplier.activated");
    }

    @PatchMapping("/{code}/suspend")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> suspend(@PathVariable String code) {
        return ApiResult.ok(svc.suspend(code), "supplier.suspended");
    }

    @PatchMapping("/{code}/reactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> reactivate(@PathVariable String code) {
        return ApiResult.ok(svc.reactivate(code), "supplier.reactivated");
    }

    @PatchMapping("/{code}/blacklist")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER')")
    public ApiResult<SupplierResponse> blacklist(@PathVariable String code) {
        return ApiResult.ok(svc.blacklist(code), "supplier.blacklisted");
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    public ApiResult<SupplierResponse> getOne(@PathVariable String code) {
        return ApiResult.ok(svc.getByCode(code));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PROCUREMENT_MANAGER','PRODUCT_MANAGER','INVENTORY_MANAGER')")
    public ApiResult<List<SupplierResponse>> search(@RequestParam(required = false) String search,
                                                    @RequestParam(required = false) SupplierStatus status, @RequestParam(required = false) String wilaya,
                                                    @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(new SupplierSearchQuery(search, status, wilaya, page, size)));
    }
}
