package com.dz.erp.inventory.returns.infrastructure.mapper;

import com.dz.erp.inventory.returns.domain.model.ReturnInspection;
import com.dz.erp.inventory.returns.infrastructure.persistence.ReturnInspectionJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReturnInspectionPersistenceMapper {
    ReturnInspectionJpaEntity toJpa(ReturnInspection r);

    default ReturnInspection toDomain(ReturnInspectionJpaEntity e) {
        if (e == null) return null;
        return ReturnInspection.reconstitute(
                e.getInspectionId(), e.getTenantId(), e.getStockRecordId(), e.getSkuCode(),
                e.getOrderId(), e.getCustomerRef(), e.getReturnDate(), e.getReturnReason(),
                e.getProductCondition(), e.getQuantity(), e.getInspectionStatus(),
                e.getInspectorId(), e.getInspectedAt(), e.getRejectionReason(),
                e.getDisposition(), e.getFifoLayerId(),
                e.getCreatedBy(), e.getCreatedAt(), e.getVersion());
    }
}
