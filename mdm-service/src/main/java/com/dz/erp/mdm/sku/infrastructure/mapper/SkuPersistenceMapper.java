package com.dz.erp.mdm.sku.infrastructure.mapper;

import com.dz.erp.mdm.sku.domain.model.Sku;
import com.dz.erp.mdm.sku.infrastructure.persistence.SkuJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SkuPersistenceMapper {
    SkuJpaEntity toJpa(Sku sku);
    default Sku toDomain(SkuJpaEntity e) {
        if (e == null) return null;
        return Sku.reconstitute(e.getSkuCode(), e.getTenantId(), e.getBaseUom(),
                e.getProductType(), e.getStatus(), e.getCreatedBy(), e.getCreatedAt(),
                e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
