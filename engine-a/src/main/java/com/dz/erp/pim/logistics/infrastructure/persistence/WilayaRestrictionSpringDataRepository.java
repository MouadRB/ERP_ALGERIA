package com.dz.erp.pim.logistics.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface WilayaRestrictionSpringDataRepository extends JpaRepository<WilayaRestrictionJpaEntity, String> {
    List<WilayaRestrictionJpaEntity> findByProductIdAndTenantId(String pid, String tid);

    boolean existsByProductIdAndWilayaCodeAndTenantId(String pid, String wc, String tid);

    @Modifying
    void deleteByProductIdAndWilayaCodeAndTenantId(String pid, String wc, String tid);

    void deleteAllByProductId(String productId, String tenantId);

}
