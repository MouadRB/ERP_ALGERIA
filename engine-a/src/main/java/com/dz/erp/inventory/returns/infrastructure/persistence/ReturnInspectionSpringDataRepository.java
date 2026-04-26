package com.dz.erp.inventory.returns.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReturnInspectionSpringDataRepository extends JpaRepository<ReturnInspectionJpaEntity, String> {

    Optional<ReturnInspectionJpaEntity> findByInspectionIdAndTenantId(String inspectionId, String tenantId);

    @Query(
            value = "SELECT r FROM ReturnInspectionJpaEntity r " +
                    "WHERE r.tenantId = :tid " +
                    "AND (:status IS NULL OR r.inspectionStatus = :status) " +
                    "ORDER BY r.createdAt DESC",
            countQuery = "SELECT COUNT(r) FROM ReturnInspectionJpaEntity r " +
                    "WHERE r.tenantId = :tid " +
                    "AND (:status IS NULL OR r.inspectionStatus = :status)"
    )
    Page<ReturnInspectionJpaEntity> findByTenant(@Param("tid") String tenantId,
                                                  @Param("status") String status,
                                                  Pageable pageable);
}
