package com.dz.erp.mdm.tax.infrastructure.persistence;

import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TaxRuleSpringDataRepository extends JpaRepository<TaxRuleJpaEntity, String> {
    Optional<TaxRuleJpaEntity> findByTaxRuleCodeAndTenantId(String code, String tid);

    boolean existsByTaxRuleCodeAndTenantId(String code, String tid);

    @Query("SELECT t FROM TaxRuleJpaEntity t WHERE t.categoryCode = :cat AND t.tenantId = :tid AND t.status = 'ACTIVE'")
    Optional<TaxRuleJpaEntity> findActiveByCategoryCodeAndTenantId(@Param("cat") String cat, @Param("tid") String tid);

    @Query("SELECT t FROM TaxRuleJpaEntity t WHERE t.tenantId = :tid " +
            "AND (:cat IS NULL OR t.categoryCode = :cat) AND (:status IS NULL OR t.status = :status)")
    Page<TaxRuleJpaEntity> search(@Param("cat") String cat, @Param("status") TaxRuleStatus status, @Param("tid") String tid, Pageable p);
}
