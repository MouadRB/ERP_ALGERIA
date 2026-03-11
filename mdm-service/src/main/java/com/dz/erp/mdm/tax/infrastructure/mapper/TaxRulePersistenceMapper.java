package com.dz.erp.mdm.tax.infrastructure.mapper;
import com.dz.erp.mdm.tax.domain.model.TaxRule;
import com.dz.erp.mdm.tax.infrastructure.persistence.TaxRuleJpaEntity;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface TaxRulePersistenceMapper {
    TaxRuleJpaEntity toJpa(TaxRule r);
    default TaxRule toDomain(TaxRuleJpaEntity e) {
        if (e == null) return null;
        return TaxRule.reconstitute(e.getTaxRuleCode(), e.getTenantId(), e.getCategoryCode(),
                e.getTaxRate(), e.getDescription(), e.getEffectiveFrom(), e.getEffectiveTo(),
                e.getStatus(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
