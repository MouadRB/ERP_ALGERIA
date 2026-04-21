package com.dz.erp.oms.returns.infrastructure.mapper;

import com.dz.erp.oms.returns.domain.model.ReturnLine;
import com.dz.erp.oms.returns.domain.model.ReturnRequest;
import com.dz.erp.oms.returns.infrastructure.persistence.ReturnLineJpaEntity;
import com.dz.erp.oms.returns.infrastructure.persistence.ReturnRequestJpaEntity;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class ReturnRequestPersistenceMapper {

    public ReturnRequestJpaEntity toJpa(ReturnRequest r, ReturnRequestJpaEntity existing) {
        var e = (existing != null) ? existing : new ReturnRequestJpaEntity();
        e.setReturnId(r.getReturnId());
        e.setTenantId(r.getTenantId());
        e.setOrderId(r.getOrderId());
        e.setReasonCode(r.getReasonCode());
        e.setReasonMessage(r.getReasonMessage());
        e.setRequestedBy(r.getRequestedBy());
        e.setStatus(r.getStatus());
        e.setCarrierCode(r.getCarrierCode());
        e.setInspectionId(r.getInspectionId());
        e.setCreatedAt(r.getCreatedAt());
        e.setPickupArrangedAt(r.getPickupArrangedAt());
        e.setClosedAt(r.getClosedAt());
        e.setUpdatedAt(r.getUpdatedAt());

        Map<UUID, ReturnLineJpaEntity> existingLines = new HashMap<>();
        for (ReturnLineJpaEntity l : e.getLines()) existingLines.put(l.getLineId(), l);

        e.getLines().clear();
        for (ReturnLine l : r.getLines()) {
            var le = existingLines.getOrDefault(l.getLineId(), new ReturnLineJpaEntity());
            le.setLineId(l.getLineId());
            le.setRequest(e);
            le.setSkuCode(l.getSkuCode());
            le.setVariantId(l.getVariantId());
            le.setQuantity(l.getQuantity());
            le.setRefundAmount(l.getRefundAmount());
            le.setReasonCode(l.getReasonCode());
            e.getLines().add(le);
        }
        return e;
    }

    public ReturnRequest toDomain(ReturnRequestJpaEntity e) {
        var lines = e.getLines().stream()
                .map(l -> ReturnLine.reconstitute(
                        l.getLineId(), l.getSkuCode(), l.getVariantId(),
                        l.getQuantity(), l.getRefundAmount(), l.getReasonCode()))
                .toList();
        return ReturnRequest.reconstitute(
                e.getReturnId(), e.getTenantId(), e.getOrderId(),
                e.getReasonCode(), e.getReasonMessage(), e.getRequestedBy(),
                lines, e.getStatus(), e.getCarrierCode(), e.getInspectionId(),
                e.getVersion(), e.getCreatedAt(), e.getPickupArrangedAt(),
                e.getClosedAt(), e.getUpdatedAt());
    }
}
