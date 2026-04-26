package com.dz.erp.oms.integration.domain.port;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;

import java.util.Optional;
import java.util.UUID;

public interface CarrierShipmentRepositoryPort {

    CarrierShipment save(CarrierShipment shipment);

    Optional<CarrierShipment> findById(String tenantId, UUID shipmentId);

    Optional<CarrierShipment> findByOrderId(String tenantId, UUID orderId);

    Optional<CarrierShipment> findByCarrierAndTracking(String carrierCode, String trackingNumber);
}
