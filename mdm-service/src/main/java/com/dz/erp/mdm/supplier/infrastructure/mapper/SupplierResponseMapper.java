package com.dz.erp.mdm.supplier.infrastructure.mapper;
import com.dz.erp.mdm.supplier.application.dto.SupplierResponse;
import com.dz.erp.mdm.supplier.domain.model.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface SupplierResponseMapper {
    @Mapping(target = "status", expression = "java(s.getStatus().name())")
    SupplierResponse toResponse(Supplier s);
}
