package com.dz.erp.mdm.wilaya.infrastructure.mapper;
import com.dz.erp.mdm.wilaya.application.dto.WilayaResponse;
import com.dz.erp.mdm.wilaya.domain.model.WilayaConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface WilayaResponseMapper {
    @Mapping(target = "status", expression = "java(w.getStatus().name())")
    WilayaResponse toResponse(WilayaConfig w);
}
