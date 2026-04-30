package com.dz.erp.pim.ocr.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record OcrJobResponse(String jobId, String tenantId, String fileName, String mimeType, long fileSizeBytes,
                             String status, int progressPercent, String errorMessage,
                             String createdBy, Instant createdAt, Instant completedAt,
                             int averageConfidence,
                             String bonNumero, LocalDate documentDate, LocalTime documentTime,
                             String clientName, Integer nbrColis, Integer nbrCondi,
                             BigDecimal totalMontant, String rawText,
                             List<OcrJobLineResponse> lines) {}
