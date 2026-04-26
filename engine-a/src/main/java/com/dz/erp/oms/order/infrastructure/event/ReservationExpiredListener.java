package com.dz.erp.oms.order.infrastructure.event;

import com.dz.erp.inventory.stock.domain.event.InventoryDomainEvent;
import com.dz.erp.oms.order.application.OrderLifecycleService;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.SecurityUser;
import com.dz.erp.shared.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Listens for {@code InventoryDomainEvent.ReservationExpired} (emitted by the
 * {@code SoftReserveExpiryJob}) and auto-cancels the backing order.
 *
 * <p>The expiry job has already released the stock reservation, so this listener
 * only transitions the order's FSM. The cancel call still releases <em>other</em>
 * reservations on the same order in case multiple lines are still alive — only
 * the expired one has gone away.
 *
 * <p>Runs in the scheduler thread which has no SecurityContext, so we install
 * a synthetic system user + tenant for the duration of the cancel call.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationExpiredListener {

    private static final String SYSTEM_USER_ID = "system-oms";
    private static final String SYSTEM_USERNAME = "system";

    private final OrderLifecycleService lifecycleService;

    @EventListener
    public void on(InventoryDomainEvent.ReservationExpired event) {
        var orderIdRaw = event.orderId();
        if (orderIdRaw == null || orderIdRaw.isBlank()) return;
        UUID orderId;
        try {
            orderId = UUID.fromString(orderIdRaw);
        } catch (IllegalArgumentException e) {
            log.warn("ReservationExpired event with non-UUID orderId '{}' — not an OMS order, skipping", orderIdRaw);
            return;
        }

        try {
            installSystemAuth(event.tenantId());
            lifecycleService.cancel(orderId,
                    ErrorCode.OMS_RESERVATION_FAILED.name(),
                    "SOFT reservation expired for SKU " + event.skuCode(),
                    SYSTEM_USER_ID);
            log.info("Order {} auto-cancelled because SOFT reservation {} expired",
                    orderId, event.aggregateId());
        } catch (Exception ex) {
            log.error("Failed to auto-cancel order {} after reservation expiry", orderId, ex);
        } finally {
            SecurityContextHolder.clearContext();
            TenantContext.clear();
        }
    }

    private static void installSystemAuth(String tenantId) {
        var user = new SecurityUser(SYSTEM_USER_ID, tenantId, SYSTEM_USERNAME, Set.of("ROLE_SYSTEM"));
        var auth = new UsernamePasswordAuthenticationToken(user, "", List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
        TenantContext.setTenantId(tenantId);
    }
}
