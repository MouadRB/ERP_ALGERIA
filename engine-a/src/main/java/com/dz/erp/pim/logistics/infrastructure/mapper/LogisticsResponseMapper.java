package com.dz.erp.pim.logistics.infrastructure.mapper;

import com.dz.erp.pim.logistics.application.dto.LogisticsResponse;
import com.dz.erp.pim.logistics.application.dto.WilayaRestrictionResponse;
import com.dz.erp.pim.logistics.domain.model.ProductLogistics;
import com.dz.erp.pim.logistics.domain.model.WilayaRestriction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LogisticsResponseMapper {

    @Mapping(target = "volumeCm3", expression = "java(logistics.getVolumeCm3())")
    @Mapping(target = "shippingWeightGrams", expression = "java(logistics.getShippingWeightGrams())")
    @Mapping(target = "restrictions", source = "restrictions")
    LogisticsResponse toResponse(ProductLogistics logistics, List<WilayaRestrictionResponse> restrictions);

    WilayaRestrictionResponse toRestrictionResponse(WilayaRestriction r);

    List<WilayaRestrictionResponse> toRestrictionResponses(List<WilayaRestriction> restrictions);
}
