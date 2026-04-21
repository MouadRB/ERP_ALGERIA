package com.dz.erp.oms.order.Api;

import com.dz.erp.oms.common.OmsApiPaths;
import com.dz.erp.oms.common.OmsRoles;
import com.dz.erp.oms.order.application.OrderIntakeService;
import com.dz.erp.oms.order.application.OrderLifecycleService;
import com.dz.erp.oms.order.application.OrderShipmentService;
import com.dz.erp.oms.order.application.dto.OrderResponse;
import com.dz.erp.oms.order.application.dto.PlaceOrderCommand;
import com.dz.erp.shared.api.ApiResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * OMS Orders REST surface. Role gating follows {@link OmsRoles}.
 *
 * <ul>
 *   <li>{@code POST   /oms/v1/orders}              — channel submission; idempotent via {@code Idempotency-Key} header.</li>
 *   <li>{@code GET    /oms/v1/orders/{id}}         — fetch a single order (tenant-scoped).</li>
 *   <li>{@code GET    /oms/v1/orders}              — paginated list for CS/admin.</li>
 *   <li>{@code POST   /oms/v1/orders/{id}/confirm} — upgrade SOFT→HARD reservations, RESERVED→CONFIRMED.</li>
 *   <li>{@code POST   /oms/v1/orders/{id}/cancel}  — release reservations, non-terminal→CANCELLED.</li>
 *   <li>{@code POST   /oms/v1/orders/{id}/packed}  — warehouse signals packing done; CONFIRMED→PACKED.
 *       Auto-submits to carrier via {@code OrderPackedListener}.</li>
 * </ul>
 */
@RestController
@RequestMapping(OmsApiPaths.ORDERS)
@RequiredArgsConstructor
public class OrderController {

    private final OrderIntakeService intake;
    private final OrderLifecycleService lifecycle;
    private final OrderShipmentService shipment;

    /**
     * Submit a new order. A repeated call with the same {@code Idempotency-Key} for the
     * same channel returns the existing order body (HTTP 200) — not an error.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.SALES_MANAGER + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<OrderResponse> place(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody PlaceOrderCommand cmd
    ) {
        return ApiResult.ok(intake.place(cmd, idempotencyKey), "oms.order.placed");
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResult<OrderResponse> getOne(@PathVariable UUID id) {
        return ApiResult.ok(intake.getById(id));
    }

    /**
     * Confirm a RESERVED order — upgrades all line reservations SOFT → HARD and
     * transitions the order to CONFIRMED. Idempotent for orders already confirmed.
     */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.SALES_MANAGER + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<OrderResponse> confirm(@PathVariable UUID id) {
        lifecycle.confirm(id);
        return ApiResult.ok(intake.getById(id), "oms.order.confirmed");
    }

    /**
     * Cancel an order — releases reservations and transitions to CANCELLED. Only
     * allowed from non-terminal states.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.SALES_MANAGER + "','" + OmsRoles.CS_AGENT + "')")
    public ApiResult<OrderResponse> cancel(@PathVariable UUID id,
                                           @RequestParam(defaultValue = "OMS_ORDER_CANCELLED_BY_USER") String reasonCode,
                                           @RequestParam(required = false) String reasonMessage) {
        lifecycle.cancel(id, reasonCode, reasonMessage, null);
        return ApiResult.ok(intake.getById(id), "oms.order.cancelled");
    }

    /**
     * Warehouse signals packing is complete — transitions CONFIRMED → PACKED.
     * The PACKED status change fires {@code OrderPackedListener}, which submits
     * the shipment to the resolved carrier automatically.
     */
    @PostMapping("/{id}/packed")
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.WAREHOUSE_STAFF + "')")
    public ApiResult<OrderResponse> markPacked(@PathVariable UUID id) {
        shipment.markPacked(id);
        return ApiResult.ok(intake.getById(id), "oms.order.packed");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResult<List<OrderResponse>> listRecent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return ApiResult.ok(intake.listRecent(page, size));
    }
}
