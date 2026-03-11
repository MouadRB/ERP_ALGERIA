package com.dz.erp.mdm.sku.infrastructure.persistence;

import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SkuSpringDataRepository extends JpaRepository<SkuJpaEntity, String> {
    Optional<SkuJpaEntity> findBySkuCodeAndTenantId(String skuCode, String tenantId);

    boolean existsBySkuCodeAndTenantId(String skuCode, String tenantId);

    @Query("SELECT s FROM SkuJpaEntity s WHERE s.tenantId = :tid " +
            "AND (:search IS NULL OR LOWER(CAST(s.skuCode AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
            "AND (:status IS NULL OR s.status = :status)")
    Page<SkuJpaEntity> search(@Param("search") String search, @Param("status") SkuStatus status,
                              @Param("tid") String tenantId, Pageable pageable);
}
