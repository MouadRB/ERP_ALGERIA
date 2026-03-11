package com.dz.erp.mdm.warehouse.infrastructure.mapper;
import com.dz.erp.mdm.warehouse.application.dto.BinResponse;
import com.dz.erp.mdm.warehouse.domain.model.BinLocation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface BinResponseMapper {
    @Mapping(target = "binType", expression = "java(b.getBinType().name())")
    @Mapping(target = "status", expression = "java(b.getStatus().name())")
    @Mapping(target = "remainingCapacity", expression = "java(b.remainingCapacity())")
    BinResponse toResponse(BinLocation b);
}
