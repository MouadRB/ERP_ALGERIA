package com.dz.erp.oms.integration.infrastructure.mapper;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.infrastructure.persistence.CarrierShipmentJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CarrierShipmentPersistenceMapper {

    public CarrierShipmentJpaEntity toJpa(CarrierShipment s, CarrierShipmentJpaEntity existing) {
        var e = (existing != null) ? existing : new CarrierShipmentJpaEntity();
        e.setShipmentId(s.getShipmentId());
        e.setTenantId(s.getTenantId());
        e.setOrderId(s.getOrderId());
        e.setCarrierCode(s.getCarrierCode());
        e.setStatus(s.getStatus());
        e.setTrackingNumber(s.getTrackingNumber());
        e.setLabelUrl(s.getLabelUrl());
        e.setFailureReasonCode(s.getFailureReasonCode());
        e.setFailureReasonMessage(s.getFailureReasonMessage());
        e.setCreatedAt(s.getCreatedAt());
        e.setSubmittedAt(s.getSubmittedAt());
        e.setPickedUpAt(s.getPickedUpAt());
        e.setDeliveredAt(s.getDeliveredAt());
        e.setUpdatedAt(s.getUpdatedAt());
        return e;
    }

    public CarrierShipment toDomain(CarrierShipmentJpaEntity e) {
        return CarrierShipment.reconstitute(
                e.getShipmentId(), e.getTenantId(), e.getOrderId(), e.getCarrierCode(),
                e.getStatus(), e.getTrackingNumber(), e.getLabelUrl(),
                e.getFailureReasonCode(), e.getFailureReasonMessage(),
                e.getVersion(),
                e.getCreatedAt(), e.getSubmittedAt(), e.getPickedUpAt(),
                e.getDeliveredAt(), e.getUpdatedAt());
    }
}
