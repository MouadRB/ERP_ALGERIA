package com.dz.erp.pim.seo.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeoSpringDataRepository extends JpaRepository<ProductSeoJpaEntity, String> {
    Optional<ProductSeoJpaEntity> findByProductIdAndTenantId(String pid, String tid);
    void deleteAllByProductId(String productId, String tenantId);

}
