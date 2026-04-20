package com.dz.erp.inventory.alert.infrastructure.mapper;

import com.dz.erp.inventory.alert.domain.model.StockAlert;
import com.dz.erp.inventory.alert.infrastructure.persistence.StockAlertJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StockAlertPersistenceMapper {
    StockAlertJpaEntity toJpa(StockAlert a);

    default StockAlert toDomain(StockAlertJpaEntity e) {
        if (e == null) return null;
        return StockAlert.reconstitute(
                e.getAlertId(), e.getTenantId(), e.getStockRecordId(), e.getSkuCode(),
                e.getAlertType(), e.getSeverity(), e.getMessage(), e.isActive(),
                e.getSuggestedQuantity(), e.getSupplierCode(), e.getSupplierLeadDays(),
                e.getTriggeredAt(), e.getResolvedAt(), e.getResolvedBy());
    }
}
