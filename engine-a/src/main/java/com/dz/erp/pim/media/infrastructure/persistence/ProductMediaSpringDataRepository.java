package com.dz.erp.pim.media.infrastructure.persistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
public interface ProductMediaSpringDataRepository extends JpaRepository<ProductMediaJpaEntity, String> {
    List<ProductMediaJpaEntity> findByProductIdOrderBySortOrder(String productId);
    long countByProductId(String productId);
    @Modifying
    void deleteByProductIdAndTenantId(String productId, String tenantId);
}
