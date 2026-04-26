package com.dz.erp.inventory.reservation.Api;

import com.dz.erp.inventory.reservation.application.dto.CreateReservationCommand;
import com.dz.erp.inventory.reservation.application.dto.ReservationResponse;
import com.dz.erp.inventory.reservation.application.service.ReservationService;
import com.dz.erp.shared.api.ApiResult;
import com.dz.erp.shared.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService svc;

    @PostMapping("/soft")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.OMS_SERVICE + "')")
    public ApiResult<ReservationResponse> createSoftReserve(@Valid @RequestBody CreateReservationCommand cmd) {
        return ApiResult.ok(svc.createSoftReserve(cmd), "reservation.created");
    }

    @PatchMapping("/{id}/upgrade")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.OMS_SERVICE + "')")
    public ApiResult<ReservationResponse> upgradeToHard(@PathVariable String id) {
        return ApiResult.ok(svc.upgradeToHard(id), "reservation.upgraded");
    }

    @PatchMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.OMS_SERVICE + "')")
    public ApiResult<Void> release(@PathVariable String id) {
        svc.releaseReservation(id);
        return ApiResult.ok(null, "reservation.released");
    }

    @PostMapping("/ship/{orderId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "')")
    public ApiResult<Void> shipOrder(@PathVariable String orderId) {
        svc.shipOrder(orderId);
        return ApiResult.ok(null, "reservation.shipped");
    }

    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.SALES_MANAGER + "','" + Roles.CS_AGENT + "','"
            + Roles.CRM_AGENT + "','" + Roles.LOGISTICS_AGENT + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.FINANCE_MANAGER + "','" + Roles.REPORTING_ANALYST + "','" + Roles.OMS_SERVICE + "')")
    public ApiResult<List<ReservationResponse>> findByOrderId(@PathVariable String orderId) {
        return ApiResult.ok(svc.findByOrderId(orderId), "reservation.list");
    }

    @GetMapping("/by-stock-record/{id}")
    @PreAuthorize("hasAnyRole('" + Roles.SUPER_ADMIN + "','" + Roles.INVENTORY_MANAGER + "','"
            + Roles.WAREHOUSE_OPERATOR + "','" + Roles.PROCUREMENT_MANAGER + "','"
            + Roles.LOGISTICS_AGENT + "','" + Roles.REPORTING_ANALYST + "')")
    public ApiResult<List<ReservationResponse>> findActiveByStockRecord(@PathVariable String id) {
        return ApiResult.ok(svc.findActiveByStockRecordId(id), "reservation.list");
    }
}
