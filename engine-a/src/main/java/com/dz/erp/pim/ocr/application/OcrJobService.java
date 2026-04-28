package com.dz.erp.pim.ocr.application;

import com.dz.erp.pim.ocr.application.dto.CommitOcrJobCommand;
import com.dz.erp.pim.ocr.application.dto.CommitOcrLine;
import com.dz.erp.pim.ocr.application.dto.OcrJobResponse;
import com.dz.erp.pim.ocr.application.mapper.OcrJobMapper;
import com.dz.erp.pim.ocr.domain.model.OcrJob;
import com.dz.erp.pim.ocr.domain.model.OcrJobLine;
import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import com.dz.erp.pim.ocr.domain.port.OcrJobRepository;
import com.dz.erp.pim.product.domain.model.Product;
import com.dz.erp.pim.product.domain.port.ProductRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class OcrJobService {

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_MIME = Set.of(
            "application/pdf", "image/jpeg", "image/jpg", "image/png");

    private final OcrJobRepository jobRepo;
    private final OcrJobMapper mapper;
    private final OcrExtractionWorker worker;
    private final ProductRepository productRepo;

    // ── Upload ──
    // NOT @Transactional: the job must be committed before the @Async worker fires;
    // jobRepo.save(...) opens its own transaction (see OcrJobRepositoryAdapter).

    public OcrJobResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new BusinessException(ErrorCode.OCR_FILE_EMPTY);
        if (file.getSize() > MAX_FILE_SIZE_BYTES)
            throw new BusinessException(ErrorCode.OCR_FILE_TOO_LARGE, MAX_FILE_SIZE_BYTES);
        var mime = file.getContentType() != null ? file.getContentType().toLowerCase() : "";
        if (!ALLOWED_MIME.contains(mime))
            throw new BusinessException(ErrorCode.OCR_FILE_UNSUPPORTED_TYPE, mime);

        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var job = OcrJob.create(tid, file.getOriginalFilename(), mime, file.getSize(), uid);
        job = jobRepo.save(job);

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.OCR_FILE_READ_ERROR);
        }

        worker.process(job.getJobId(), tid, file.getOriginalFilename(), mime, content);
        log.info("OCR job {} queued for tenant {} (file: {}, {} bytes)",
                job.getJobId(), tid, file.getOriginalFilename(), file.getSize());
        return mapper.toResponse(job);
    }

    // ── Read ──

    @Transactional(readOnly = true)
    public OcrJobResponse get(String jobId) {
        var tid = AuthContext.currentTenantId();
        var job = jobRepo.findById(jobId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.OCR_JOB_NOT_FOUND, jobId));
        return mapper.toResponse(job);
    }

    @Transactional(readOnly = true)
    public Page<OcrJobResponse> search(OcrJobStatus status, int page, int size) {
        var tid = AuthContext.currentTenantId();
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jobRepo.search(status, tid, pageable).map(mapper::toResponse);
    }

    // ── Commit ──

    @Transactional
    public OcrJobResponse commit(String jobId, CommitOcrJobCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var job = jobRepo.findById(jobId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.OCR_JOB_NOT_FOUND, jobId));
        if (job.getStatus() != OcrJobStatus.EXTRACTED)
            throw new BusinessException(ErrorCode.OCR_JOB_INVALID_STATE, job.getStatus(), OcrJobStatus.COMMITTED);

        Map<String, OcrJobLine> linesById = new HashMap<>();
        for (OcrJobLine line : job.getLines()) linesById.put(line.getLineId(), line);

        for (CommitOcrLine cmdLine : cmd.lines()) {
            var line = linesById.get(cmdLine.lineId());
            if (line == null)
                throw new BusinessException(ErrorCode.OCR_LINE_NOT_FOUND, cmdLine.lineId());

            line.applyUserEdits(cmdLine.nameFr(), cmdLine.nameAr(), cmdLine.supplierCode(),
                    cmdLine.categoryCode(), cmdLine.qty(), cmdLine.salePrice(), cmdLine.costPrice());

            var skuCode = cmdLine.skuCode() != null ? cmdLine.skuCode() : line.getSkuCode();
            var product = Product.createFromOcr(tid, skuCode, null,
                    line.getSupplierCode(), line.getCategoryCode(), line.getNameFr(), uid);
            product = productRepo.save(product);
            line.markAccepted(product.getProductId());
            log.info("OCR product draft created: {} (sku={}, jobLine={})",
                    product.getProductId(), product.getSkuCode(), line.getLineId());
        }

        job.markCommitted();
        var saved = jobRepo.save(job);
        return mapper.toResponse(saved);
    }

    // ── Cancel ──

    @Transactional
    public OcrJobResponse cancel(String jobId) {
        var tid = AuthContext.currentTenantId();
        var job = jobRepo.findById(jobId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.OCR_JOB_NOT_FOUND, jobId));
        job.markCancelled();
        var saved = jobRepo.save(job);
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public long countAwaitingReview() {
        return jobRepo.countByStatus(OcrJobStatus.EXTRACTED, AuthContext.currentTenantId());
    }
}
