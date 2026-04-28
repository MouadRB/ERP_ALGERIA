package com.dz.erp.pim.ocr.infrastructure.persistence;

import com.dz.erp.pim.ocr.domain.model.OcrConfidence;
import com.dz.erp.pim.ocr.domain.model.OcrJob;
import com.dz.erp.pim.ocr.domain.model.OcrJobLine;
import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import com.dz.erp.pim.ocr.domain.port.OcrJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OcrJobRepositoryAdapter implements OcrJobRepository {

    private final OcrJobSpringDataRepository jobJpa;
    private final OcrJobLineSpringDataRepository lineJpa;

    @Override
    @Transactional
    public OcrJob save(OcrJob job) {
        var jobEntity = jobJpa.findById(job.getJobId()).orElseGet(OcrJobJpaEntity::new);
        jobEntity.setJobId(job.getJobId());
        jobEntity.setTenantId(job.getTenantId());
        jobEntity.setFileName(job.getFileName());
        jobEntity.setMimeType(job.getMimeType());
        jobEntity.setFileSizeBytes(job.getFileSizeBytes());
        jobEntity.setStatus(job.getStatus());
        jobEntity.setProgressPercent(job.getProgressPercent());
        jobEntity.setErrorMessage(job.getErrorMessage());
        jobEntity.setRawJson(job.getRawJson());
        jobEntity.setCreatedBy(job.getCreatedBy());
        jobEntity.setCreatedAt(job.getCreatedAt());
        jobEntity.setCompletedAt(job.getCompletedAt());
        jobJpa.save(jobEntity);

        // Replace lines: delete existing, insert current
        lineJpa.deleteByJobId(job.getJobId());
        if (!job.getLines().isEmpty()) {
            var lineEntities = job.getLines().stream().map(OcrJobRepositoryAdapter::toLineEntity).toList();
            lineJpa.saveAll(lineEntities);
        }
        return reload(job.getJobId());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OcrJob> findById(String jobId, String tenantId) {
        return jobJpa.findByJobIdAndTenantId(jobId, tenantId).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OcrJob> search(OcrJobStatus status, String tenantId, Pageable pageable) {
        return jobJpa.search(status, tenantId, pageable).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(OcrJobStatus status, String tenantId) {
        return jobJpa.countByStatusAndTenantId(status, tenantId);
    }

    private OcrJob reload(String jobId) {
        var jobEntity = jobJpa.findById(jobId).orElseThrow();
        return toDomain(jobEntity);
    }

    private OcrJob toDomain(OcrJobJpaEntity j) {
        var lines = new ArrayList<OcrJobLine>();
        for (var l : lineJpa.findByJobIdOrderByLineIndex(j.getJobId())) lines.add(toDomainLine(l));
        return new OcrJob(j.getJobId(), j.getTenantId(), j.getFileName(), j.getMimeType(), j.getFileSizeBytes(),
                j.getStatus(), j.getProgressPercent(), j.getErrorMessage(), j.getRawJson(),
                j.getCreatedBy(), j.getCreatedAt(), j.getCompletedAt(), lines);
    }

    private OcrJobLine toDomainLine(OcrJobLineJpaEntity l) {
        var conf = new OcrConfidence(l.getConfidenceOverall(), l.getConfidenceNameFr(),
                l.getConfidencePrice(), l.getConfidenceCost(), l.getConfidenceCategory());
        return new OcrJobLine(l.getLineId(), l.getJobId(), l.getLineIndex(),
                l.getSkuCode(), l.getNameFr(), l.getNameAr(),
                l.getSupplierCode(), l.getCategoryCode(),
                l.getQty(), l.getSalePrice(), l.getCostPrice(), conf,
                l.isAccepted(), l.getProductId());
    }

    private static OcrJobLineJpaEntity toLineEntity(OcrJobLine line) {
        var e = new OcrJobLineJpaEntity();
        e.setLineId(line.getLineId());
        e.setJobId(line.getJobId());
        e.setLineIndex(line.getLineIndex());
        e.setSkuCode(line.getSkuCode());
        e.setNameFr(line.getNameFr());
        e.setNameAr(line.getNameAr());
        e.setSupplierCode(line.getSupplierCode());
        e.setCategoryCode(line.getCategoryCode());
        e.setQty(line.getQty());
        e.setSalePrice(line.getSalePrice());
        e.setCostPrice(line.getCostPrice());
        var c = line.getConfidence();
        e.setConfidenceOverall(c.overall());
        e.setConfidenceNameFr(c.nameFr());
        e.setConfidencePrice(c.price());
        e.setConfidenceCost(c.cost());
        e.setConfidenceCategory(c.category());
        e.setAccepted(line.isAccepted());
        e.setProductId(line.getProductId());
        return e;
    }
}
