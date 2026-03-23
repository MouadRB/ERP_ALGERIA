package com.dz.erp.pim.variant.infrastructure.mapper;
import com.dz.erp.pim.variant.domain.model.Variant;
import com.dz.erp.pim.variant.infrastructure.persistence.VariantJpaEntity;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface VariantPersistenceMapper {
    VariantJpaEntity toJpa(Variant v);
    default Variant toDomain(VariantJpaEntity e) { if (e == null) return null;
        return Variant.reconstitute(e.getVariantId(), e.getProductId(), e.getTenantId(), e.getSkuCode(),
                e.getLabel(), e.getBarcode(), e.getPriceOverride(), e.getCostOverride(),
                e.getStockQuantity(), e.getStockThreshold(), e.getStatus(),
                e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion()); }
}
