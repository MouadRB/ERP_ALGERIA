package com.dz.erp.mdm.tax.domain.port;

import com.dz.erp.mdm.tax.domain.model.TaxRule;
import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface TaxRuleRepository {
    TaxRule save(TaxRule rule);

    Optional<TaxRule> findByTaxRuleCode(String code, String tenantId);

    boolean existsByTaxRuleCode(String code, String tenantId);

    Optional<TaxRule> findActiveByCategoryCode(String categoryCode, String tenantId);

    Page<TaxRule> search(String categoryCode, TaxRuleStatus status, String tenantId, Pageable pageable);
}
