package com.dz.erp.mdm.sku.infrastructure.mapper;

import com.dz.erp.mdm.sku.application.dto.SkuResponse;
import com.dz.erp.mdm.sku.domain.model.Sku;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SkuResponseMapper {
    @Mapping(target = "productType", expression = "java(sku.getProductType().name())")
    @Mapping(target = "status", expression = "java(sku.getStatus().name())")
    SkuResponse toResponse(Sku sku);
}
