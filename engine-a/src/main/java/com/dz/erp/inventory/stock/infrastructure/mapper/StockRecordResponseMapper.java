package com.dz.erp.inventory.stock.infrastructure.mapper;

import com.dz.erp.inventory.stock.application.dto.StockRecordResponse;
import com.dz.erp.inventory.stock.domain.model.StockRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockRecordResponseMapper {
    @Mapping(target = "status", expression = "java(r.getStatus().name())")
    @Mapping(target = "available", expression = "java(r.getAvailable())")
    @Mapping(target = "stockValue", expression = "java(r.getFifoValuation())")
    StockRecordResponse toResponse(StockRecord r);
}
