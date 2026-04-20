package com.dz.erp.oms.integration.application;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.domain.port.CarrierShipmentRepositoryPort;
import com.dz.erp.oms.integration.domain.port.ShipmentEventPort;
import com.dz.erp.oms.integration.infrastructure.carrier.CarrierRouter;
import com.dz.erp.oms.integration.infrastructure.carrier.ManualCarrierAdapter;
import com.dz.erp.oms.order.application.OrderShipmentService;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stage 4 — creates a {@link CarrierShipment} for a packed order and submits it to
 * the appropriate carrier adapter. Transitions the order PACKED → SHIPMENT_REQUESTED
 * as part of the same transaction.
 *
 * <p>Carrier selection is delegated to {@link CarrierRouter}: it consults the per-tenant
 * wilaya-based routing table first, then falls back to {@code oms.integration.default-carrier}
 * (defaults to {@code MANUAL}).
 *
 * <p>Idempotent on {@code orderId}: re-submission returns the existing shipment unchanged.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentSubmissionService {

    private final CarrierShipmentRepositoryPort shipmentRepo;
    private final ShipmentEventPort shipmentEvents;
    private final CarrierRouter carrierRouter;
    private final OrderShipmentService orderShipment;

    @Value("${oms.integration.default-carrier:" + ManualCarrierAdapter.CODE + "}")
    private String defaultCarrierCode;

    @Transactional
    public CarrierShipment submitForOrder(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();

        var existing = shipmentRepo.findByOrderId(tenantId, orderId);
        if (existing.isPresent()) {
            log.debug("Shipment already exists for order {} — idempotent return", orderId);
            return existing.get();
        }

        var carrier = carrierRouter.resolveForOrder(tenantId, orderId, defaultCarrierCode);
        var now = LocalDateTime.now();
        var shipment = CarrierShipment.create(tenantId, orderId, carrier.carrierCode(), now);

        try {
            var result = carrier.submit(shipment);
            shipment.markSubmitted(result.trackingNumber(), result.labelUrl(), LocalDateTime.now());
        } catch (RuntimeException ex) {
            log.error("Carrier submission failed for order {} ({}): {}", orderId,
                    carrier.carrierCode(), ex.getMessage(), ex);
            throw new BusinessException(ErrorCode.OMS_CARRIER_SUBMIT_FAILED, carrier.carrierCode());
        }

        var saved = persistAndPublish(shipment);
        orderShipment.markShipmentRequested(orderId);
        return saved;
    }

    private CarrierShipment persistAndPublish(CarrierShipment shipment) {
        var events = shipment.drainEvents();
        var saved = shipmentRepo.save(shipment);
        events.forEach(e -> shipmentEvents.publish(e.eventType(), e.aggregateId(), e));
        return saved;
    }
}
