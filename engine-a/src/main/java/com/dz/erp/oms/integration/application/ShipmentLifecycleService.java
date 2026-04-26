package com.dz.erp.oms.integration.application;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.domain.model.NormalizedCarrierEvent;
import com.dz.erp.oms.integration.domain.port.CarrierShipmentRepositoryPort;
import com.dz.erp.oms.integration.domain.port.CarrierWebhookDedupePort;
import com.dz.erp.oms.integration.domain.port.ShipmentEventPort;
import com.dz.erp.oms.order.application.OrderShipmentService;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Translates normalized carrier webhook events into shipment + order transitions.
 * Deduplicates on {@code (carrierCode, eventId)} — replays from the carrier are dropped.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentLifecycleService {

    private final CarrierShipmentRepositoryPort shipmentRepo;
    private final ShipmentEventPort shipmentEvents;
    private final CarrierWebhookDedupePort dedupe;
    private final OrderShipmentService orderShipment;

    @Transactional
    public void handle(NormalizedCarrierEvent evt) {
        if (!dedupe.register(evt.carrierCode(), evt.eventId())) {
            log.info("Duplicate webhook {}:{} — dropped", evt.carrierCode(), evt.eventId());
            return;
        }

        var shipment = shipmentRepo
                .findByCarrierAndTracking(evt.carrierCode(), evt.trackingNumber())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.OMS_SHIPMENT_NOT_FOUND, evt.trackingNumber()));

        var now = evt.occurredAt() != null ? evt.occurredAt() : LocalDateTime.now();

        switch (evt.event()) {
            case PICKED_UP -> {
                shipment.markPickedUp(now);
                orderShipment.markHandedToCarrier(shipment.getOrderId(), shipment.getTenantId());
            }
            case IN_TRANSIT -> {
                shipment.markInTransit(now);
                orderShipment.markInTransit(shipment.getOrderId(), shipment.getTenantId());
            }
            case DELIVERED -> {
                shipment.markDelivered(now);
                orderShipment.markDelivered(shipment.getOrderId(), shipment.getTenantId());
            }
            case FAILED -> {
                shipment.markFailed(evt.reasonCode(), evt.reasonMessage(), now);
                orderShipment.markDeliveryFailed(
                        shipment.getOrderId(), shipment.getTenantId(),
                        evt.reasonCode(), evt.reasonMessage());
            }
            case SUBMITTED -> {
                log.debug("Ignoring redundant SUBMITTED webhook for shipment {}", shipment.getShipmentId());
                return;
            }
        }

        persistAndPublish(shipment);
    }

    private void persistAndPublish(CarrierShipment shipment) {
        var events = shipment.drainEvents();
        shipmentRepo.save(shipment);
        events.forEach(e -> shipmentEvents.publish(e.eventType(), e.aggregateId(), e));
    }
}
