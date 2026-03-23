package com.dz.erp.pim.variant.infrastructure.mapper;

import com.dz.erp.pim.variant.application.dto.VariantAttributeResponse;
import com.dz.erp.pim.variant.domain.model.VariantAttribute;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VariantAttributeResponseMapper {
    VariantAttributeResponse toResponse(VariantAttribute a);
    List<VariantAttributeResponse> toResponses(List<VariantAttribute> attributes);
}
