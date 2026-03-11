package com.dz.erp.mdm.wilaya.infrastructure.mapper;
import com.dz.erp.mdm.wilaya.domain.model.WilayaConfig;
import com.dz.erp.mdm.wilaya.infrastructure.persistence.WilayaJpaEntity;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface WilayaPersistenceMapper {
    WilayaJpaEntity toJpa(WilayaConfig w);
    default WilayaConfig toDomain(WilayaJpaEntity e) {
        if (e == null) return null;
        return WilayaConfig.reconstitute(e.getWilayaCode(), e.getTenantId(), e.getName(), e.getNameAr(),
                e.getZone(), e.getDeliveryCostDzd(), e.getEstimatedDays(), e.isDeliverable(),
                e.getNotes(), e.getStatus(), e.getCreatedBy(), e.getCreatedAt(),
                e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
