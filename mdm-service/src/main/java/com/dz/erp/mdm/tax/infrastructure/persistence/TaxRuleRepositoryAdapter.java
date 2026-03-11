package com.dz.erp.mdm.tax.infrastructure.persistence;

import com.dz.erp.mdm.tax.domain.model.TaxRule;
import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import com.dz.erp.mdm.tax.domain.port.TaxRuleRepository;
import com.dz.erp.mdm.tax.infrastructure.mapper.TaxRulePersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TaxRuleRepositoryAdapter implements TaxRuleRepository {
    private final TaxRuleSpringDataRepository jpa;
    private final TaxRulePersistenceMapper mapper;

    @Override
    public TaxRule save(TaxRule r) {
        return mapper.toDomain(jpa.save(mapper.toJpa(r)));
    }

    @Override
    public Optional<TaxRule> findByTaxRuleCode(String c, String t) {
        return jpa.findByTaxRuleCodeAndTenantId(c, t).map(mapper::toDomain);
    }

    @Override
    public boolean existsByTaxRuleCode(String c, String t) {
        return jpa.existsByTaxRuleCodeAndTenantId(c, t);
    }

    @Override
    public Optional<TaxRule> findActiveByCategoryCode(String cat, String t) {
        return jpa.findActiveByCategoryCodeAndTenantId(cat, t).map(mapper::toDomain);
    }

    @Override
    public Page<TaxRule> search(String cat, TaxRuleStatus st, String t, Pageable p) {
        return jpa.search(cat, st, t, p).map(mapper::toDomain);
    }
}
