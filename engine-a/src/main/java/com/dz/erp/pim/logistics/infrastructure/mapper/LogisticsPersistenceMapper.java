package com.dz.erp.pim.logistics.infrastructure.mapper;

import com.dz.erp.pim.logistics.domain.model.ProductLogistics;
import com.dz.erp.pim.logistics.infrastructure.persistence.ProductLogisticsJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogisticsPersistenceMapper {

    ProductLogisticsJpaEntity toJpa(ProductLogistics d);

    default ProductLogistics toDomain(ProductLogisticsJpaEntity e) {
        if (e == null) return null;
        return ProductLogistics.reconstitute(
                e.getProductId(), e.getTenantId(),
                e.getStockAlertThreshold(), e.getReorderQuantity(),
                e.getReorderLeadDays(), e.isAutoReorderEnabled(),
                e.getWeightGrams(), e.getLengthCm(), e.getWidthCm(), e.getHeightCm(),
                e.getPackagingWeightGrams(), e.getPackagingType(), e.isFragile(),
                e.getVersion());
    }
}
