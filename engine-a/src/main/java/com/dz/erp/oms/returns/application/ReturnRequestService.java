package com.dz.erp.oms.returns.application;

import com.dz.erp.oms.integration.infrastructure.carrier.ManualCarrierAdapter;
import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.oms.returns.application.dto.CreateReturnRequestCommand;
import com.dz.erp.oms.returns.application.dto.ReturnRequestResponse;
import com.dz.erp.oms.returns.domain.model.ReturnLine;
import com.dz.erp.oms.returns.domain.model.ReturnRequest;
import com.dz.erp.oms.returns.domain.port.ReturnEventPort;
import com.dz.erp.oms.returns.domain.port.ReturnRequestRepositoryPort;
import com.dz.erp.oms.shared.port.InventoryReturnsPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stage 6 — orchestrates the customer return lifecycle.
 *
 * <pre>
 *   request  → DELIVERED → RETURN_REQUESTED (order) + REQUESTED (return)
 *   pickup   → RETURN_IN_INSPECTION (order) + IN_INSPECTION (return) + inventory quarantine
 *   close    → RETURNED / COMPLETED (order) + CLOSED_* (return) + refund (when approved)
 * </pre>
 *
 * <p>Return window is configurable via {@code oms.returns.window-days} (default 14).
 * Measured from Order's {@code deliveredAt}; a missing timestamp blocks the return.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReturnRequestService {

    private final ReturnRequestRepositoryPort returnRepo;
    private final ReturnEventPort returnEvents;
    private final OrderRepositoryPort orderRepo;
    private final InventoryReturnsPort inventoryReturns;

    @Value("${oms.returns.window-days:14}")
    private int returnWindowDays;

    @Transactional
    public ReturnRequest request(CreateReturnRequestCommand cmd) {
        var tenantId = AuthContext.currentTenantId();
        var order = orderRepo.findById(tenantId, cmd.orderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, cmd.orderId()));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException(ErrorCode.OMS_ORDER_INVALID_STATE, order.getStatus().name());
        }

        if (order.getDeliveredAt() == null) {
            throw new BusinessException(ErrorCode.OMS_RETURN_WINDOW_EXPIRED, "delivered_at missing");
        }
        var daysSince = Duration.between(order.getDeliveredAt(), LocalDateTime.now()).toDays();
        if (daysSince > returnWindowDays) {
            throw new BusinessException(ErrorCode.OMS_RETURN_WINDOW_EXPIRED,
                    "return window " + returnWindowDays + "d exceeded (" + daysSince + "d)");
        }

        var lines = cmd.lines().stream()
                .map(l -> ReturnLine.create(
                        l.skuCode(), l.variantId(), l.quantity(),
                        l.refundAmount(), l.reasonCode()))
                .toList();
        var request = ReturnRequest.create(tenantId, cmd.orderId(), lines,
                cmd.reasonCode(), cmd.reasonMessage(),
                AuthContext.currentUserId(), LocalDateTime.now());

        var saved = persistAndPublish(request);
        order.markReturnRequested(AuthContext.currentUserId(), LocalDateTime.now());
        orderRepo.save(order);
        return saved;
    }

    @Transactional
    public ReturnRequest arrangePickup(UUID returnId) {
        var tenantId = AuthContext.currentTenantId();
        var req = returnRepo.findById(tenantId, returnId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_RETURN_NOT_FOUND, returnId));

        // Open an inspection on the inventory side per first SKU (simplification — one return line
        // creates one inspection; multi-line returns reuse the first SKU for the aggregate id).
        var first = req.getLines().get(0);
        var inspectionId = inventoryReturns.openInspection(
                tenantId, first.getSkuCode(), totalQuantity(req), AuthContext.currentUserId());

        req.arrangePickup(ManualCarrierAdapter.CODE, inspectionId, LocalDateTime.now());
        var saved = persistAndPublish(req);

        var order = orderRepo.findById(tenantId, req.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, req.getOrderId()));
        order.markReturnInInspection(AuthContext.currentUserId(), LocalDateTime.now());
        orderRepo.save(order);
        return saved;
    }

    /** CS closes the return as APPROVED — inventory restocks per disposition + refund issued. */
    @Transactional
    public ReturnRequest closeApproved(UUID returnId) {
        var tenantId = AuthContext.currentTenantId();
        var req = returnRepo.findById(tenantId, returnId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_RETURN_NOT_FOUND, returnId));

        if (req.getInspectionId() != null) {
            inventoryReturns.approveInspection(tenantId, req.getInspectionId(),
                    AuthContext.currentUserId());
        }
        req.closeApproved(LocalDateTime.now());
        var saved = persistAndPublish(req);

        var order = orderRepo.findById(tenantId, req.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, req.getOrderId()));
        order.markReturned(AuthContext.currentUserId(), LocalDateTime.now());
        orderRepo.save(order);
        return saved;
    }

    /** CS closes the return as REJECTED — no restock, no refund, order resumes COMPLETED. */
    @Transactional
    public ReturnRequest closeRejected(UUID returnId) {
        var tenantId = AuthContext.currentTenantId();
        var req = returnRepo.findById(tenantId, returnId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_RETURN_NOT_FOUND, returnId));

        if (req.getInspectionId() != null) {
            inventoryReturns.rejectInspection(tenantId, req.getInspectionId(),
                    AuthContext.currentUserId());
        }
        req.closeRejected(LocalDateTime.now());
        var saved = persistAndPublish(req);

        var order = orderRepo.findById(tenantId, req.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, req.getOrderId()));
        // Rejected returns leave the order in its current return-in-inspection state — CS may
        // reopen or transition to COMPLETED manually. We auto-complete for now.
        order.markCompleted(AuthContext.currentUserId(), LocalDateTime.now());
        orderRepo.save(order);
        return saved;
    }

    @Transactional(readOnly = true)
    public ReturnRequest findById(UUID returnId) {
        return returnRepo.findById(AuthContext.currentTenantId(), returnId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_RETURN_NOT_FOUND, returnId));
    }

    public ReturnRequestResponse toResponse(ReturnRequest r) {
        var lines = r.getLines().stream()
                .map(l -> new ReturnRequestResponse.Line(
                        l.getLineId(), l.getSkuCode(), l.getVariantId(),
                        l.getQuantity(), l.getRefundAmount(), l.getReasonCode()))
                .toList();
        return new ReturnRequestResponse(
                r.getReturnId(), r.getOrderId(), r.getStatus(),
                r.getReasonCode(), r.getReasonMessage(),
                r.getCarrierCode(), r.getInspectionId(),
                r.getCreatedAt(), r.getPickupArrangedAt(), r.getClosedAt(),
                lines);
    }

    private int totalQuantity(ReturnRequest req) {
        return req.getLines().stream().mapToInt(ReturnLine::getQuantity).sum();
    }

    private ReturnRequest persistAndPublish(ReturnRequest request) {
        var events = request.drainEvents();
        var saved = returnRepo.save(request);
        events.forEach(e -> returnEvents.publish(e.eventType(), e.aggregateId(), e));
        return saved;
    }
}
