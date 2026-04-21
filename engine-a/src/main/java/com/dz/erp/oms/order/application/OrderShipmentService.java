package com.dz.erp.oms.order.application;

import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import com.dz.erp.shared.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stage 4 — order-side transitions driven by fulfillment completion and carrier
 * webhook events. Kept separate from {@link OrderLifecycleService} so that system
 * callers (listeners, webhook controllers) don't inherit the full inventory-facing
 * cancel/confirm dependencies.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderShipmentService {

    public static final String SYSTEM_USER_ID = "system-oms";

    private final OrderRepositoryPort orderRepo;
    private final OrderEventPort orderEvents;

    /** CONFIRMED → PACKED. Called by the warehouse (Inventaire) when items finish packing. */
    @Transactional
    public void markPacked(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();
        apply(tenantId, orderId, safeActor(), Order::markPacked);
    }

    /** PACKED → SHIPMENT_REQUESTED. Called from ShipmentSubmissionService after carrier accepts. */
    @Transactional
    public void markShipmentRequested(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();
        apply(tenantId, orderId, safeActor(), Order::markShipmentRequested);
    }

    @Transactional
    public void markHandedToCarrier(UUID orderId, String tenantId) {
        applyAsSystem(tenantId, orderId, Order::markHandedToCarrier);
    }

    @Transactional
    public void markInTransit(UUID orderId, String tenantId) {
        applyAsSystem(tenantId, orderId, Order::markInTransit);
    }

    @Transactional
    public void markDelivered(UUID orderId, String tenantId) {
        applyAsSystem(tenantId, orderId, Order::markDelivered);
    }

    @Transactional
    public void markDeliveryFailed(UUID orderId, String tenantId, String reasonCode, String reasonMessage) {
        var previousTenant = TenantContext.getTenantId();
        try {
            TenantContext.setTenantId(tenantId);
            var order = orderRepo.findById(tenantId, orderId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));
            order.markDeliveryFailed(reasonCode, reasonMessage, SYSTEM_USER_ID, LocalDateTime.now());
            persistAndPublish(order);
        } finally {
            restoreTenant(previousTenant);
        }
    }

    @FunctionalInterface
    private interface OrderTransition {
        void apply(Order order, String actor, LocalDateTime now);
    }

    private void apply(String tenantId, UUID orderId, String actor, OrderTransition transition) {
        var order = orderRepo.findById(tenantId, orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));
        transition.apply(order, actor, LocalDateTime.now());
        persistAndPublish(order);
    }

    private void applyAsSystem(String tenantId, UUID orderId, OrderTransition transition) {
        var previousTenant = TenantContext.getTenantId();
        try {
            TenantContext.setTenantId(tenantId);
            apply(tenantId, orderId, SYSTEM_USER_ID, transition);
        } finally {
            restoreTenant(previousTenant);
        }
    }

    private void restoreTenant(String previous) {
        if (previous != null) TenantContext.setTenantId(previous);
        else TenantContext.clear();
    }

    private String safeActor() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return AuthContext.currentUserId();
            }
        } catch (Exception ignored) {}
        return SYSTEM_USER_ID;
    }

    private void persistAndPublish(Order order) {
        var events = order.drainEvents();
        orderRepo.save(order);
        events.forEach(e -> orderEvents.publish(e.eventType(), e.aggregateId(), e));
    }

}
