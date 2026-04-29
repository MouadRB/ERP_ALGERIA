package com.dz.erp.pim.ocr.domain.port;

import com.dz.erp.pim.ocr.domain.model.OcrJob;
import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface OcrJobRepository {
    OcrJob save(OcrJob job);

    Optional<OcrJob> findById(String jobId, String tenantId);

    Page<OcrJob> search(OcrJobStatus status, String tenantId, Pageable pageable);

    long countByStatus(OcrJobStatus status, String tenantId);
}
