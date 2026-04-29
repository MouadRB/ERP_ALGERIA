package com.dz.erp.pim.ocr.infrastructure.persistence;

import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OcrJobSpringDataRepository extends JpaRepository<OcrJobJpaEntity, String> {

    Optional<OcrJobJpaEntity> findByJobIdAndTenantId(String jobId, String tenantId);

    @Query("""
            select j from OcrJobJpaEntity j
            where j.tenantId = :tenantId
              and (:status is null or j.status = :status)
            """)
    Page<OcrJobJpaEntity> search(@Param("status") OcrJobStatus status,
                                 @Param("tenantId") String tenantId,
                                 Pageable pageable);

    long countByStatusAndTenantId(OcrJobStatus status, String tenantId);
}
