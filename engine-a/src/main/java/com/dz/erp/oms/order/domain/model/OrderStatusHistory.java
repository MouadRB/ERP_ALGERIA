package com.dz.erp.oms.order.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Immutable audit record for every status transition.
 *
 * <p>Appended by {@link Order} on each transition method. Never edited.
 * Used by Customer Service to reconstruct an order's history and by
 * compliance for tamper-evident audit.
 *
 * @param fromStatus   previous status — {@code null} iff this is the intake row
 * @param toStatus     new status
 * @param event        the domain event that caused the transition (e.g. {@code OMS_ORDER_VALIDATED})
 * @param actorUserId  user who triggered the transition, or {@code "SYSTEM"} for automated steps
 */
public record OrderStatusHistory(
        UUID id,
        UUID orderId,
        OrderStatus fromStatus,
        OrderStatus toStatus,
        String event,
        String actorUserId,
        LocalDateTime at
) {
    public static OrderStatusHistory record(UUID orderId, OrderStatus from, OrderStatus to,
                                            String event, String actorUserId, LocalDateTime at) {
        return new OrderStatusHistory(UUID.randomUUID(), orderId, from, to, event, actorUserId, at);
    }
}
