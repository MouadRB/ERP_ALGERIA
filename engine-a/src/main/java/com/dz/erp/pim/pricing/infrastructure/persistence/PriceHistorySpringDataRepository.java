package com.dz.erp.pim.pricing.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceHistorySpringDataRepository extends JpaRepository<PriceHistoryJpaEntity, String> {
    List<PriceHistoryJpaEntity> findByProductIdAndTenantIdOrderByChangedAtDesc(String productId, String tenantId);
    void deleteAllByProductId(String productId, String tenantId);

}
