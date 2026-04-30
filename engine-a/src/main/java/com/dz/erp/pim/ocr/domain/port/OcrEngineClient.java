package com.dz.erp.pim.ocr.domain.port;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface OcrEngineClient {

    record ExtractedLine(String nameFr, String nameAr, String supplierCode, String categoryCode,
                         Integer qty, BigDecimal salePrice, BigDecimal costPrice,
                         int confidenceOverall, int confidenceNameFr, int confidencePrice,
                         int confidenceCost, int confidenceCategory) {}

    record DocumentMeta(String bonNumero, LocalDate documentDate, LocalTime documentTime,
                        String clientName, Integer nbrColis, Integer nbrCondi,
                        BigDecimal totalMontant, String rawText) {
        public static DocumentMeta empty() {
            return new DocumentMeta(null, null, null, null, null, null, null, null);
        }
    }

    record ExtractionResult(List<ExtractedLine> lines, String rawJson, boolean requiresManualReview,
                            DocumentMeta documentMeta) {}

    ExtractionResult extract(String fileName, String mimeType, byte[] content);
}
