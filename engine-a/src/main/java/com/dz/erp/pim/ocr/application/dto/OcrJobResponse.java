package com.dz.erp.pim.ocr.application.dto;

import java.time.Instant;
import java.util.List;

public record OcrJobResponse(String jobId, String tenantId, String fileName, String mimeType, long fileSizeBytes,
                             String status, int progressPercent, String errorMessage,
                             String createdBy, Instant createdAt, Instant completedAt,
                             int averageConfidence,
                             List<OcrJobLineResponse> lines) {}
