package com.dz.erp.pim.variant.infrastructure.mapper;

import com.dz.erp.pim.variant.domain.model.VariantAttribute;
import com.dz.erp.pim.variant.infrastructure.persistence.VariantAttributeJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VariantAttributePersistenceMapper {

    VariantAttributeJpaEntity toJpa(VariantAttribute d);

    default VariantAttribute toDomain(VariantAttributeJpaEntity e) {
        if (e == null) return null;
        return VariantAttribute.reconstitute(
                e.getAttributeId(), e.getVariantId(), e.getTenantId(),
                e.getKey(), e.getValueFr(), e.getValueAr(),
                e.getUnit(), e.getSortOrder());
    }
}
