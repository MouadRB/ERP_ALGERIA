package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.application.dto.FifoLayerResponse;
import com.dz.erp.inventory.stock.domain.model.FifoLayer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FifoLayerResponseMapper {
    @Mapping(target = "status", expression = "java(l.getStatus().name())")
    @Mapping(target = "remainingValue", expression = "java(l.getRemainingValue())")
    FifoLayerResponse toResponse(FifoLayer l);
}
