package com.dz.erp.pim.variant.infrastructure.mapper;
import com.dz.erp.pim.variant.application.dto.VariantResponse;
import com.dz.erp.pim.variant.domain.model.Variant;
import org.mapstruct.Mapper; import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface VariantResponseMapper {
    @Mapping(target = "status", expression = "java(v.getStatus().name())")
    VariantResponse toResponse(Variant v);
}
