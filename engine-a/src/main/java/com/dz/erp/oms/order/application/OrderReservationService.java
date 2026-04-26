package com.dz.erp.oms.order.application;

import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.oms.shared.port.InventoryReservationPort;
import com.dz.erp.oms.shared.port.InventoryReservationPort.InsufficientStockException;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Stage 2 — reservation orchestration.
 *
 * <p>Transitions {@code VALIDATED → RESERVED} (happy) or {@code VALIDATED → AWAITING_STOCK}
 * (any-line-fails). On partial failure, previously-created reservations on <b>this</b>
 * order are released inside the same transaction so we never leak SOFT holds.
 *
 * <p>Invoked by {@code OrderValidatedListener} synchronously after the validation
 * transaction commits — listener-level retry can re-drive the reservation if the
 * order is still in {@code VALIDATED}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderReservationService {

    private final OrderRepositoryPort orderRepo;
    private final OrderEventPort orderEvents;
    private final InventoryReservationPort inventory;

    /**
     * Reserve every line of {@code orderId}. Idempotent: if the order is already
     * {@code RESERVED}, {@code AWAITING_STOCK}, or further in the lifecycle, this is a no-op.
     */
    @Transactional
    public void reserve(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();
        var order = orderRepo.findById(tenantId, orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));

        if (order.getStatus() != com.dz.erp.oms.order.domain.model.OrderStatus.VALIDATED) {
            log.debug("reserve({}) — order is {}; skipping (not VALIDATED)", orderId, order.getStatus());
            return;
        }

        var actor = AuthContext.currentUserId();
        var now = LocalDateTime.now();
        var created = new ArrayList<UUID>();

        try {
            for (var line : order.getLines()) {
                var reservationId = inventory.softReserve(orderId, line.getSkuCode(), line.getQuantity());
                order.attachLineReservation(line.getSkuCode(), reservationId);
                created.add(reservationId);
            }
            order.markReserved(actor, now);
            persistAndPublish(order);
            log.info("Order {} RESERVED with {} reservation(s)", orderId, created.size());

        } catch (InsufficientStockException e) {
            log.warn("Order {} cannot be fully reserved (sku={}, reason={}); releasing {} partial SOFT reservation(s)",
                    orderId, e.skuCode(), e.getMessage(), created.size());
            releaseQuietly(created);
            var freshOrder = orderRepo.findById(tenantId, orderId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));
            freshOrder.markAwaitingStock(
                    ErrorCode.OMS_STOCK_INSUFFICIENT.name(),
                    "SKU " + e.skuCode() + ": " + e.getMessage(),
                    actor, now);
            persistAndPublish(freshOrder);
        }
    }

    private void persistAndPublish(Order order) {
        var events = order.drainEvents();
        orderRepo.save(order);
        events.forEach(e -> orderEvents.publish(e.eventType(), e.aggregateId(), e));
    }

    private void releaseQuietly(List<UUID> reservationIds) {
        for (var id : reservationIds) {
            try {
                inventory.release(id);
            } catch (Exception ex) {
                log.error("Failed to release reservation {} during rollback; will rely on SOFT expiry", id, ex);
            }
        }
    }
}
