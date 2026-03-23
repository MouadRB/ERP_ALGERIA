package com.dz.erp.pim.variant.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface VariantSpringDataRepository extends JpaRepository<VariantJpaEntity, String> {
    Optional<VariantJpaEntity> findByVariantIdAndTenantId(String id, String tid);

    Optional<VariantJpaEntity> findBySkuCodeAndTenantId(String sku, String tid);

    List<VariantJpaEntity> findByProductIdAndTenantIdOrderByLabel(String pid, String tid);

    boolean existsBySkuCodeAndTenantId(String sku, String tid);

    @Modifying
    void deleteByProductIdAndTenantId(String productId, String tenantId);

}
