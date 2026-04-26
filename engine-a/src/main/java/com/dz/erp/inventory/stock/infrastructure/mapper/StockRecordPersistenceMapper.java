package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.domain.model.StockRecord;
import com.dz.erp.inventory.stock.infrastructure.persistence.StockRecordJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StockRecordPersistenceMapper {
    StockRecordJpaEntity toJpa(StockRecord r);

    default StockRecord toDomain(StockRecordJpaEntity e) {
        if (e == null) return null;
        return StockRecord.reconstitute(
                e.getStockRecordId(), e.getTenantId(), e.getSkuCode(),
                e.getProductId(), e.getVariantId(),
                e.getTotalQuantity(), e.getSoftReserved(), e.getHardReserved(), e.getQuarantine(),
                e.getReorderThreshold(), e.getReorderQuantity(), e.isTrackable(), e.isFrozen(),
                e.getStatus(), e.getFifoValuation(), e.getWeightedAvgCost(),
                e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
