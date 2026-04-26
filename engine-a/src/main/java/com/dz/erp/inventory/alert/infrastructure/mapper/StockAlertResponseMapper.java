package com.dz.erp.inventory.alert.infrastructure.mapper;

import com.dz.erp.inventory.alert.application.dto.StockAlertResponse;
import com.dz.erp.inventory.alert.domain.model.StockAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StockAlertResponseMapper {
    @Mapping(target = "alertType", expression = "java(a.getAlertType().name())")
    @Mapping(target = "severity", expression = "java(a.getSeverity().name())")
    StockAlertResponse toResponse(StockAlert a);
}
