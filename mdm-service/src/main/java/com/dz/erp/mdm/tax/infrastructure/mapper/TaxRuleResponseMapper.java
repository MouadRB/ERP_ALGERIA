package com.dz.erp.mdm.tax.infrastructure.mapper;
import com.dz.erp.mdm.tax.application.dto.TaxRuleResponse;
import com.dz.erp.mdm.tax.domain.model.TaxRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface TaxRuleResponseMapper {
    @Mapping(target = "status", expression = "java(r.getStatus().name())")
    TaxRuleResponse toResponse(TaxRule r);
}
