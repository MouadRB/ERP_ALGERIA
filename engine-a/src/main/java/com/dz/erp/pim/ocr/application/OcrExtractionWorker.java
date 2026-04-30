package com.dz.erp.pim.ocr.application;

import com.dz.erp.pim.ocr.domain.model.OcrConfidence;
import com.dz.erp.pim.ocr.domain.model.OcrJob;
import com.dz.erp.pim.ocr.domain.model.OcrJobLine;
import com.dz.erp.pim.ocr.domain.port.OcrEngineClient;
import com.dz.erp.pim.ocr.domain.port.OcrJobRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@RequiredArgsConstructor
public class OcrExtractionWorker {

    private static final AtomicInteger SKU_SEQ = new AtomicInteger(1);

    private final OcrEngineClient engineClient;
    private final OcrJobRepository jobRepo;

    @Async("ocrTaskExecutor")
    @Transactional
    public void process(String jobId, String tenantId, String fileName, String mimeType, byte[] content) {
        TenantContext.setTenantId(tenantId);
        try {
            var job = jobRepo.findById(jobId, tenantId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.OCR_JOB_NOT_FOUND, jobId));

            job.markProgress(30);
            jobRepo.save(job);

            OcrEngineClient.ExtractionResult result;
            try {
                result = engineClient.extract(fileName, mimeType, content);
            } catch (Exception ex) {
                log.warn("OCR extraction failed for job {}: {}", jobId, ex.getMessage());
                job.markFailed("OCR engine error: " + ex.getMessage());
                jobRepo.save(job);
                return;
            }

            List<OcrJobLine> lines = toJobLines(jobId, result.lines());
            job.markExtracted(result.rawJson(), lines);
            var meta = result.documentMeta();
            if (meta != null) {
                job.applyDocumentMeta(meta.bonNumero(), meta.documentDate(), meta.documentTime(),
                        meta.clientName(), meta.nbrColis(), meta.nbrCondi(),
                        meta.totalMontant(), meta.rawText());
            }
            jobRepo.save(job);
            log.info("OCR job {} extracted {} line(s), bonNumero={}, client={}",
                    jobId, lines.size(),
                    meta != null ? meta.bonNumero() : null,
                    meta != null ? meta.clientName() : null);
        } finally {
            TenantContext.clear();
        }
    }

    private List<OcrJobLine> toJobLines(String jobId, List<OcrEngineClient.ExtractedLine> extracted) {
        if (extracted == null || extracted.isEmpty()) return List.of();
        return java.util.stream.IntStream.range(0, extracted.size())
                .mapToObj(i -> {
                    var e = extracted.get(i);
                    var sku = "SKU-OCR-" + String.format("%03d", SKU_SEQ.getAndIncrement());
                    var conf = new OcrConfidence(e.confidenceOverall(), e.confidenceNameFr(),
                            e.confidencePrice(), e.confidenceCost(), e.confidenceCategory());
                    return OcrJobLine.extract(jobId, i, sku, e.nameFr(), e.nameAr(),
                            e.supplierCode(), e.categoryCode(),
                            e.qty(), e.salePrice(), e.costPrice(), conf);
                })
                .toList();
    }
}
