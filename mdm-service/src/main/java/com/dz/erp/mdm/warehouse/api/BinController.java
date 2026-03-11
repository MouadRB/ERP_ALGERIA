package com.dz.erp.mdm.warehouse.api;

import com.dz.erp.mdm.warehouse.application.BinService;
import com.dz.erp.mdm.warehouse.application.dto.*;
import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mdm/v1/bins")
@RequiredArgsConstructor
public class BinController {
    private final BinService svc;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<BinResponse> create(@Valid @RequestBody CreateBinCommand cmd) {
        return ApiResult.ok(svc.create(cmd), "bin.created");
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<BinResponse> update(@PathVariable String code, @Valid @RequestBody UpdateBinCommand cmd) {
        return ApiResult.ok(svc.update(code, cmd), "bin.updated");
    }

    @PatchMapping("/{code}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<BinResponse> activate(@PathVariable String code) {
        return ApiResult.ok(svc.activate(code), "bin.activated");
    }

    @PatchMapping("/{code}/deactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<BinResponse> deactivate(@PathVariable String code) {
        return ApiResult.ok(svc.deactivate(code), "bin.deactivated");
    }

    @PatchMapping("/{code}/reactivate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<BinResponse> reactivate(@PathVariable String code) {
        return ApiResult.ok(svc.reactivate(code), "bin.reactivated");
    }

    @GetMapping("/{code}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<BinResponse> getOne(@PathVariable String code) {
        return ApiResult.ok(svc.getByCode(code));
    }

    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<BinResponse>> available(@RequestParam(required = false) String zone) {
        return ApiResult.ok(svc.findAvailable(zone));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','WAREHOUSE_MANAGER')")
    public ApiResult<List<BinResponse>> search(@RequestParam(required = false) String zone, @RequestParam(required = false) BinType binType, @RequestParam(required = false) BinStatus status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        return ApiResult.paged(svc.search(new BinSearchQuery(zone, binType, status, page, size)));
    }
}
