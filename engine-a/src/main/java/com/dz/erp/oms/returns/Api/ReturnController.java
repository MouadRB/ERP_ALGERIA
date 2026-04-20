package com.dz.erp.oms.returns.Api;

import com.dz.erp.oms.common.OmsApiPaths;
import com.dz.erp.oms.common.OmsRoles;
import com.dz.erp.oms.returns.application.ReturnRequestService;
import com.dz.erp.oms.returns.application.dto.CreateReturnRequestCommand;
import com.dz.erp.oms.returns.application.dto.ReturnRequestResponse;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(OmsApiPaths.RETURNS)
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnRequestService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<ReturnRequestResponse> open(@Valid @RequestBody CreateReturnRequestCommand cmd) {
        var r = service.request(cmd);
        return ApiResult.ok(service.toResponse(r), "oms.return.requested");
    }

    @PostMapping("/{returnId}/arrange-pickup")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<ReturnRequestResponse> arrangePickup(@PathVariable UUID returnId) {
        var r = service.arrangePickup(returnId);
        return ApiResult.ok(service.toResponse(r), "oms.return.pickup.arranged");
    }

    @PostMapping("/{returnId}/approve")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<ReturnRequestResponse> approve(@PathVariable UUID returnId) {
        var r = service.closeApproved(returnId);
        return ApiResult.ok(service.toResponse(r), "oms.return.closed.approved");
    }

    @PostMapping("/{returnId}/reject")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<ReturnRequestResponse> reject(@PathVariable UUID returnId) {
        var r = service.closeRejected(returnId);
        return ApiResult.ok(service.toResponse(r), "oms.return.closed.rejected");
    }

    @GetMapping("/{returnId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<ReturnRequestResponse> getOne(@PathVariable UUID returnId) {
        return ApiResult.ok(service.toResponse(service.findById(returnId)));
    }
}
