package com.dz.erp.pim.logistics.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LogisticsSpringDataRepository extends JpaRepository<ProductLogisticsJpaEntity, String> {
    Optional<ProductLogisticsJpaEntity> findByProductIdAndTenantId(String pid, String tid);
    void deleteAllByProductId(String productId, String tenantId);

}
