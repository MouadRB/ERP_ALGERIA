package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.domain.model.StockMovement;
import com.dz.erp.inventory.stock.infrastructure.persistence.StockMovementJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StockMovementPersistenceMapper {
    StockMovementJpaEntity toJpa(StockMovement m);

    default StockMovement toDomain(StockMovementJpaEntity e) {
        if (e == null) return null;
        return StockMovement.reconstitute(
                e.getMovementId(), e.getTenantId(), e.getStockRecordId(), e.getSkuCode(),
                e.getMovementType(), e.getQuantityChange(), e.getQuantityBefore(), e.getQuantityAfter(),
                e.getUnitCost(), e.getTotalCost(), e.getReferenceType(), e.getReferenceId(),
                e.getReason(), e.getFifoLayerId(), e.getPerformedBy(), e.getPerformedAt(),
                e.getAuditHash(), e.getPreviousHash());
    }
}
