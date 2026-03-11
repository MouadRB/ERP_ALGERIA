package com.dz.erp.mdm.warehouse.infrastructure.mapper;
import com.dz.erp.mdm.warehouse.domain.model.BinLocation;
import com.dz.erp.mdm.warehouse.infrastructure.persistence.BinJpaEntity;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface BinPersistenceMapper {
    BinJpaEntity toJpa(BinLocation b);
    default BinLocation toDomain(BinJpaEntity e) {
        if (e == null) return null;
        return BinLocation.reconstitute(e.getBinCode(), e.getTenantId(), e.getZone(), e.getRack(),
                e.getShelf(), e.getMaxCapacity(), e.getCurrentOccupancy(), e.getReservedCapacity(),
                e.getBinType(), e.getStatus(), e.getNotes(),
                e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
