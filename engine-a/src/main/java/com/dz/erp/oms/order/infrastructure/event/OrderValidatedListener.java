package com.dz.erp.oms.order.infrastructure.event;

import com.dz.erp.oms.order.application.OrderReservationService;
import com.dz.erp.oms.order.domain.event.OrderDomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Stage 2 bridge — drives the reservation flow synchronously as soon as the
 * validation transaction commits an {@code ORDER_VALIDATED} event into the outbox.
 *
 * <p>Runs on the same thread as the intake transaction — SecurityContext and
 * TenantContext are still populated. Any reservation failure here leaves the
 * order in {@code AWAITING_STOCK} (not rolled back) — the listener treats
 * reservation as its own bounded transaction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderValidatedListener {

    private final OrderReservationService reservationService;

    @EventListener
    public void on(OrderDomainEvent.OrderValidated event) {
        log.debug("OrderValidated received — triggering reservation for order {}", event.aggregateId());
        reservationService.reserve(UUID.fromString(event.aggregateId()));
    }
}
