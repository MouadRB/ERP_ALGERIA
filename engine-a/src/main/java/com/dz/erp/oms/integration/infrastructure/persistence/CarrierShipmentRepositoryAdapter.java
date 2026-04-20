package com.dz.erp.oms.integration.infrastructure.persistence;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.domain.port.CarrierShipmentRepositoryPort;
import com.dz.erp.oms.integration.infrastructure.mapper.CarrierShipmentPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CarrierShipmentRepositoryAdapter implements CarrierShipmentRepositoryPort {

    private final CarrierShipmentSpringDataRepository repo;
    private final CarrierShipmentPersistenceMapper mapper;

    @Override
    public CarrierShipment save(CarrierShipment shipment) {
        var existing = repo.findById(shipment.getShipmentId()).orElse(null);
        var merged = mapper.toJpa(shipment, existing);
        return mapper.toDomain(repo.save(merged));
    }

    @Override
    public Optional<CarrierShipment> findById(String tenantId, UUID shipmentId) {
        return repo.findByShipmentIdAndTenantId(shipmentId, tenantId).map(mapper::toDomain);
    }

    @Override
    public Optional<CarrierShipment> findByOrderId(String tenantId, UUID orderId) {
        return repo.findByOrderIdAndTenantId(orderId, tenantId).map(mapper::toDomain);
    }

    @Override
    public Optional<CarrierShipment> findByCarrierAndTracking(String carrierCode, String trackingNumber) {
        return repo.findByCarrierCodeAndTrackingNumber(carrierCode, trackingNumber).map(mapper::toDomain);
    }
}
