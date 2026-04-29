package com.dz.erp.pim.ocr.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OcrJob {
    private final String jobId;
    private final String tenantId;
    private final String fileName;
    private final String mimeType;
    private final long fileSizeBytes;
    private OcrJobStatus status;
    private int progressPercent;
    private String errorMessage;
    private String rawJson;
    private final String createdBy;
    private final Instant createdAt;
    private Instant completedAt;
    private List<OcrJobLine> lines;

    public static OcrJob create(String tenantId, String fileName, String mimeType, long sizeBytes, String createdBy) {
        return new OcrJob(UUID.randomUUID().toString(), tenantId, fileName, mimeType, sizeBytes,
                OcrJobStatus.PROCESSING, 5, null, null, createdBy, Instant.now(), null, new ArrayList<>());
    }

    public void markProgress(int percent) {
        if (status != OcrJobStatus.PROCESSING) return;
        this.progressPercent = Math.min(99, Math.max(0, percent));
    }

    public void markExtracted(String rawJson, List<OcrJobLine> extractedLines) {
        if (status != OcrJobStatus.PROCESSING)
            throw new BusinessException(ErrorCode.OCR_JOB_INVALID_STATE, status, OcrJobStatus.EXTRACTED);
        this.rawJson = rawJson;
        this.lines = extractedLines != null ? extractedLines : new ArrayList<>();
        this.status = OcrJobStatus.EXTRACTED;
        this.progressPercent = 100;
    }

    public void markFailed(String message) {
        this.status = OcrJobStatus.FAILED;
        this.errorMessage = truncate(message);
        this.completedAt = Instant.now();
    }

    public void markCommitted() {
        if (status != OcrJobStatus.EXTRACTED)
            throw new BusinessException(ErrorCode.OCR_JOB_INVALID_STATE, status, OcrJobStatus.COMMITTED);
        this.status = OcrJobStatus.COMMITTED;
        this.completedAt = Instant.now();
    }

    public void markCancelled() {
        if (status == OcrJobStatus.COMMITTED)
            throw new BusinessException(ErrorCode.OCR_JOB_INVALID_STATE, status, OcrJobStatus.CANCELLED);
        this.status = OcrJobStatus.CANCELLED;
        this.completedAt = Instant.now();
    }

    public List<OcrJobLine> getLines() {
        return lines != null ? Collections.unmodifiableList(lines) : List.of();
    }

    private static String truncate(String s) {
        if (s == null) return null;
        return s.length() > 1000 ? s.substring(0, 1000) : s;
    }
}
