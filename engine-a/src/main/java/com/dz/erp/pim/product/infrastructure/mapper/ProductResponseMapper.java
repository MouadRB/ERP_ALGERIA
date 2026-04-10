package com.dz.erp.pim.product.infrastructure.mapper;

import com.dz.erp.pim.product.application.dto.ProductResponse;
import com.dz.erp.pim.product.domain.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductResponseMapper {
    @Mapping(target = "status", expression = "java(p.getStatus().name())")
    @Mapping(target = "returnPolicy", expression = "java(p.getReturnPolicy().name())")
    @Mapping(target = "origin", expression = "java(p.getOrigin() != null ? p.getOrigin().name() : null)")
    @Mapping(target = "flagged", expression = "java(p.isFlagged())")
    @Mapping(target = "skuActivationBlocked", expression = "java(p.isSkuActivationBlocked())")
    ProductResponse toResponse(Product p);
}
