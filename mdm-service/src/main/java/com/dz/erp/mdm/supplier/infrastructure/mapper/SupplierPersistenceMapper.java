package com.dz.erp.mdm.supplier.infrastructure.mapper;
import com.dz.erp.mdm.supplier.domain.model.Supplier;
import com.dz.erp.mdm.supplier.infrastructure.persistence.SupplierJpaEntity;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface SupplierPersistenceMapper {
    SupplierJpaEntity toJpa(Supplier s);
    default Supplier toDomain(SupplierJpaEntity e) {
        if (e == null) return null;
        return Supplier.reconstitute(e.getSupplierCode(), e.getTenantId(), e.getCompanyName(),
                e.getContactName(), e.getPhone(), e.getEmail(), e.getAddress(), e.getWilayaCode(),
                e.getTaxId(), e.getPaymentTermDays(), e.getStatus(), e.getNotes(),
                e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
