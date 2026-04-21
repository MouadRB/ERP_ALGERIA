package com.dz.erp.oms.order.application;

import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.oms.shared.port.InventoryReservationPort;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stage 2 — confirmation + cancellation transitions that span OMS ↔ Inventory.
 *
 * <p>{@code confirm(orderId)} upgrades every line's reservation SOFT → HARD and
 * transitions {@code RESERVED → CONFIRMED}. {@code cancel(orderId, reason)} releases
 * live reservations and transitions to {@code CANCELLED} — used by the reservation-expired
 * listener and operator cancellations.
 *
 * <p>All mutations run in a single transaction; any inventory failure rolls back the
 * status change too — the order stays in its previous state and can be retried.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderLifecycleService {

    private final OrderRepositoryPort orderRepo;
    private final OrderEventPort orderEvents;
    private final InventoryReservationPort inventory;

    /**
     * RESERVED → CONFIRMED. Upgrades every line's SOFT reservation to HARD.
     * Idempotent: no-op if already CONFIRMED or later.
     */
    @Transactional
    public void confirm(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();
        var order = orderRepo.findById(tenantId, orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));

        if (order.getStatus() == OrderStatus.CONFIRMED
                || order.getStatus().ordinal() > OrderStatus.CONFIRMED.ordinal()) {
            log.debug("confirm({}) — already in {}; no-op", orderId, order.getStatus());
            return;
        }
        if (order.getStatus() != OrderStatus.RESERVED) {
            throw new BusinessException(ErrorCode.OMS_ORDER_INVALID_STATE, order.getStatus().name());
        }

        for (var line : order.getLines()) {
            if (line.getReservationId() == null) {
                throw new BusinessException(ErrorCode.OMS_RESERVATION_FAILED,
                        "line " + line.getSkuCode() + " has no reservation");
            }
            inventory.upgradeToHard(line.getReservationId());
        }

        order.markConfirmed(AuthContext.currentUserId(), LocalDateTime.now());
        persistAndPublish(order);
        log.info("Order {} CONFIRMED — all reservations upgraded to HARD", orderId);
    }

    /**
     * Non-terminal → CANCELLED. Releases any active reservations on this order first.
     * Used by operator cancellations and by the SOFT-expiry auto-cancel path.
     *
     * @param actorUserIdOverride used by system-triggered cancellations (expiry job)
     *                            when there is no SecurityContext — pass null to pull from AuthContext.
     */
    @Transactional
    public void cancel(UUID orderId, String reasonCode, String reasonMessage, String actorUserIdOverride) {
        var tenantId = AuthContext.currentTenantId();
        var order = orderRepo.findById(tenantId, orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));

        if (order.getStatus() == OrderStatus.CANCELLED
                || order.getStatus() == OrderStatus.COMPLETED
                || order.getStatus() == OrderStatus.REJECTED) {
            log.debug("cancel({}) — already terminal ({}); no-op", orderId, order.getStatus());
            return;
        }

        for (var line : order.getLines()) {
            if (line.getReservationId() != null) {
                try {
                    inventory.release(line.getReservationId());
                } catch (Exception ex) {
                    log.warn("Release reservation {} failed during cancel of order {}; continuing",
                            line.getReservationId(), orderId, ex);
                }
            }
        }

        var actor = (actorUserIdOverride != null) ? actorUserIdOverride : AuthContext.currentUserId();
        order.markCancelled(reasonCode, reasonMessage, actor, LocalDateTime.now());
        persistAndPublish(order);
        log.info("Order {} CANCELLED (reason={})", orderId, reasonCode);
    }

    private void persistAndPublish(Order order) {
        var events = order.drainEvents();
        orderRepo.save(order);
        events.forEach(e -> orderEvents.publish(e.eventType(), e.aggregateId(), e));
    }
}
