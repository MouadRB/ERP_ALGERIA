package com.dz.erp.pim.pricing.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriceSpringDataRepository extends JpaRepository<ProductPriceJpaEntity, String> {
    Optional<ProductPriceJpaEntity> findByProductIdAndTenantId(String productId, String tenantId);
    void deleteAllByProductId(String productId, String tenantId);

}
