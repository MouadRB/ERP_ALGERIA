package com.dz.erp.oms.integration.infrastructure.event;

import com.dz.erp.oms.integration.application.ShipmentSubmissionService;
import com.dz.erp.oms.order.domain.event.OrderDomainEvent;
import com.dz.erp.oms.order.domain.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPackedListener {

    private final ShipmentSubmissionService submission;

    @EventListener
    public void on(OrderDomainEvent.OrderStatusChanged event) {
        if (event.toStatus() != OrderStatus.PACKED) return;
        log.debug("Order {} PACKED — submitting shipment", event.aggregateId());
        submission.submitForOrder(UUID.fromString(event.aggregateId()));
    }
}
