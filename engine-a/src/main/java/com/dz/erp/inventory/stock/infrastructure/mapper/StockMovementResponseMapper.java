package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.application.dto.StockMovementResponse;
import com.dz.erp.inventory.stock.domain.model.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockMovementResponseMapper {
    @Mapping(target = "movementType", expression = "java(m.getMovementType().name())")
    StockMovementResponse toResponse(StockMovement m);
}
