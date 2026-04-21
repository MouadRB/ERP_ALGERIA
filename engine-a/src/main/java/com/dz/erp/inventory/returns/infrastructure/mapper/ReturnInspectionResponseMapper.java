package com.dz.erp.inventory.returns.infrastructure.mapper;

import com.dz.erp.inventory.returns.application.dto.ReturnInspectionResponse;
import com.dz.erp.inventory.returns.domain.model.ReturnInspection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReturnInspectionResponseMapper {
    @Mapping(target = "returnReason", expression = "java(r.getReturnReason().name())")
    @Mapping(target = "productCondition", expression = "java(r.getProductCondition().name())")
    @Mapping(target = "inspectionStatus", expression = "java(r.getInspectionStatus().name())")
    @Mapping(target = "disposition", expression = "java(r.getDisposition() != null ? r.getDisposition().name() : null)")
    ReturnInspectionResponse toResponse(ReturnInspection r);
}
