package com.dz.erp.pim.logistics.infrastructure.mapper;

import com.dz.erp.pim.logistics.domain.model.WilayaRestriction;
import com.dz.erp.pim.logistics.infrastructure.persistence.WilayaRestrictionJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WilayaRestrictionPersistenceMapper {

    WilayaRestrictionJpaEntity toJpa(WilayaRestriction d);

    default WilayaRestriction toDomain(WilayaRestrictionJpaEntity e) {
        if (e == null) return null;
        return WilayaRestriction.reconstitute(
                e.getRestrictionId(), e.getProductId(), e.getTenantId(),
                e.getWilayaCode(), e.getReason(), e.getRestrictedAt(), e.getRestrictedBy());
    }
}
