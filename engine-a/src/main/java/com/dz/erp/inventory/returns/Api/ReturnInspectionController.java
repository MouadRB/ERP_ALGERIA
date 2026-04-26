package com.dz.erp.inventory.returns.Api;

import com.dz.erp.inventory.returns.application.dto.CreateReturnCommand;
import com.dz.erp.inventory.returns.application.dto.InspectReturnCommand;
import com.dz.erp.inventory.returns.application.dto.ReturnInspectionResponse;
import com.dz.erp.inventory.returns.application.service.ReturnInspectionService;
import com.dz.erp.inventory.returns.domain.model.InspectionStatus;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory/v1/returns")
@RequiredArgsConstructor
public class ReturnInspectionController {
    private final ReturnInspectionService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "')")
    public ApiResult<ReturnInspectionResponse> createReturn(@Valid @RequestBody CreateReturnCommand cmd) {
        return ApiResult.ok(svc.createReturn(cmd), "return.created");
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "')")
    public ApiResult<ReturnInspectionResponse> approve(@PathVariable String id) {
        return ApiResult.ok(svc.approveReturn(id), "return.approved");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "')")
    public ApiResult<ReturnInspectionResponse> reject(@PathVariable String id,
                                                       @Valid @RequestBody InspectReturnCommand cmd) {
        return ApiResult.ok(svc.rejectReturn(id, cmd), "return.rejected");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.LOGISTICS_AGENT + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<Page<ReturnInspectionResponse>> list(
            @RequestParam(required = false) InspectionStatus status,
            Pageable pageable) {
        return ApiResult.ok(svc.list(status, pageable), "return.list");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.LOGISTICS_AGENT + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<ReturnInspectionResponse> getById(@PathVariable String id) {
        return ApiResult.ok(svc.getById(id), "return.found");
    }
}
