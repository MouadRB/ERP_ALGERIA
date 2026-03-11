package com.dz.erp.mdm.wilaya.api;

import com.dz.erp.mdm.wilaya.application.WilayaService;
import com.dz.erp.mdm.wilaya.application.dto.*;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mdm/v1/wilayas")
@RequiredArgsConstructor
public class WilayaController {
    private final WilayaService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<WilayaResponse> create(@Valid @RequestBody CreateWilayaCommand cmd) {
        return ApiResult.ok(svc.create(cmd), "wilaya.created");
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<WilayaResponse> update(@PathVariable String code, @Valid @RequestBody UpdateWilayaCommand cmd) {
        return ApiResult.ok(svc.update(code, cmd), "wilaya.updated");
    }

    @PatchMapping("/{code}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<WilayaResponse> activate(@PathVariable String code) {
        return ApiResult.ok(svc.activate(code), "wilaya.activated");
    }

    @PatchMapping("/{code}/deactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<WilayaResponse> deactivate(@PathVariable String code) {
        return ApiResult.ok(svc.deactivate(code), "wilaya.deactivated");
    }

    @PatchMapping("/{code}/reactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<WilayaResponse> reactivate(@PathVariable String code) {
        return ApiResult.ok(svc.reactivate(code), "wilaya.reactivated");
    }

    @GetMapping("/{code}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<WilayaResponse> getOne(@PathVariable String code) {
        return ApiResult.ok(svc.getByCode(code));
    }

    @GetMapping("/deliverable")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<WilayaResponse>> deliverable() {
        return ApiResult.ok(svc.findDeliverable());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','LOGISTICS_MANAGER')")
    public ApiResult<List<WilayaResponse>> search(@RequestParam(required = false) String zone, @RequestParam(required = false) Boolean deliverable, @RequestParam(required = false) WilayaStatus status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(new WilayaSearchQuery(zone, deliverable, status, page, size)));
    }
}
