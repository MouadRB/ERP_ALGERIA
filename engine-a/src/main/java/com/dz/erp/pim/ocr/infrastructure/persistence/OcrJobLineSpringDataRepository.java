package com.dz.erp.pim.ocr.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface OcrJobLineSpringDataRepository extends JpaRepository<OcrJobLineJpaEntity, String> {
    List<OcrJobLineJpaEntity> findByJobIdOrderByLineIndex(String jobId);

    @Modifying
    void deleteByJobId(String jobId);
}
