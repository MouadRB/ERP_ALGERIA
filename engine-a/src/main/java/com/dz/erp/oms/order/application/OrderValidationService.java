package com.dz.erp.oms.order.application;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.oms.shared.port.CatalogChannelPort;
import com.dz.erp.oms.shared.port.CatalogProductPort;
import com.dz.erp.oms.shared.port.MdmAddressPort;
import com.dz.erp.oms.shared.port.MdmUnavailableException;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Runs the intake-time validation transitions on an {@link Order}.
 *
 * <p>Stage 1: synchronous — called directly by {@code OrderIntakeService} right
 * after {@code place()}. Checks channel active, products published, and wilaya
 * supported. On the first failure the order transitions to {@code REJECTED}
 * with the matching {@link ErrorCode}.
 *
 * <p>Stage 7+: this service can also be invoked asynchronously by a scheduled retry
 * job when MDM is temporarily unreachable — see design §3.3.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderValidationService {

    private final OrderRepositoryPort orderRepo;
    private final OrderEventPort orderEvents;
    private final CatalogChannelPort channelPort;
    private final CatalogProductPort productPort;
    private final MdmAddressPort addressPort;

    /**
     * Validate the order's invariants and transition to {@code VALIDATED} or {@code REJECTED}.
     * Persists the updated aggregate and drains its events into the outbox.
     *
     * @return the stored order in its post-validation state
     */
    @Transactional
    public Order validate(Order order) {
        String tenantId = order.getTenantId();
        String actor = AuthContext.currentUserId();
        LocalDateTime now = LocalDateTime.now();

        try {
            if (!channelPort.isChannelActive(tenantId, order.getChannelCode())) {
                return reject(order, ErrorCode.OMS_CHANNEL_INACTIVE,
                        "Channel not active: " + order.getChannelCode(), actor, now);
            }

            Set<String> skus = order.getLines().stream()
                    .map(l -> l.getSkuCode())
                    .collect(Collectors.toSet());
            if (!productPort.areAllPublishedOnChannel(tenantId, order.getChannelCode(), skus)) {
                return reject(order, ErrorCode.OMS_PRODUCT_NOT_PUBLISHED_ON_CHANNEL,
                        "One or more SKUs not published on channel", actor, now);
            }

            if (!addressPort.isWilayaSupported(tenantId, order.getShippingAddress().wilayaCode())) {
                return reject(order, ErrorCode.OMS_WILAYA_NOT_SUPPORTED,
                        "Wilaya not supported: " + order.getShippingAddress().wilayaCode(), actor, now);
            }

            order.markValidated(actor, now);
            log.info("{} → VALIDATED for tenant={}", OmsEventTypes.ORDER_VALIDATED, tenantId);
            return persistAndPublish(order);
        } catch (MdmUnavailableException mdmEx) {
            // Transient — MDM circuit open or all retries exhausted. Leave the
            // order in RECEIVED; the scheduled revalidation loop will pick it up.
            log.warn("MDM unavailable during validation of order {} (tenant={}): {} — leaving in RECEIVED",
                    order.getOrderId(), tenantId, mdmEx.getMessage());
            return order;
        }
    }

    private Order reject(Order order, ErrorCode reason, String message,
                         String actor, LocalDateTime now) {
        order.markRejected(reason.name(), message, actor, now);
        log.info("{} → REJECTED (reason={}) for tenant={}",
                OmsEventTypes.ORDER_REJECTED, reason.name(), order.getTenantId());
        return persistAndPublish(order);
    }

    /**
     * Drains events <em>before</em> save so they reach the outbox even though
     * {@code orderRepo.save} returns a freshly-reconstituted aggregate whose
     * pending-events list is empty.
     */
    private Order persistAndPublish(Order order) {
        var events = order.drainEvents();
        var saved = orderRepo.save(order);
        events.forEach(e -> orderEvents.publish(e.eventType(), e.aggregateId(), e));
        return saved;
    }
}
