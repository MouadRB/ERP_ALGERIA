package com.dz.erp.oms.integration.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CarrierShipmentSpringDataRepository extends JpaRepository<CarrierShipmentJpaEntity, UUID> {

    Optional<CarrierShipmentJpaEntity> findByShipmentIdAndTenantId(UUID shipmentId, String tenantId);

    Optional<CarrierShipmentJpaEntity> findByOrderIdAndTenantId(UUID orderId, String tenantId);

    Optional<CarrierShipmentJpaEntity> findByCarrierCodeAndTrackingNumber(String carrierCode, String trackingNumber);
}
