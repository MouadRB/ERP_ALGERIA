package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.domain.model.FifoLayer;
import com.dz.erp.inventory.stock.infrastructure.persistence.FifoLayerJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FifoLayerPersistenceMapper {
    FifoLayerJpaEntity toJpa(FifoLayer l);

    default FifoLayer toDomain(FifoLayerJpaEntity e) {
        if (e == null) return null;
        return FifoLayer.reconstitute(
                e.getLayerId(), e.getTenantId(), e.getStockRecordId(),
                e.getSkuCode(), e.getLayerNumber(), e.getReceptionDate(),
                e.getPurchaseOrderRef(), e.getSupplierCode(),
                e.getInitialQuantity(), e.getRemainingQuantity(),
                e.getUnitCost(), e.getStatus(), e.getCreatedAt(), e.getDepletedAt());
    }
}
