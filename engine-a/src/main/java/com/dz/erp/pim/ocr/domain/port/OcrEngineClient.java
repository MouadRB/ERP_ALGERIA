package com.dz.erp.pim.ocr.domain.port;

import java.math.BigDecimal;
import java.util.List;

public interface OcrEngineClient {

    record ExtractedLine(String nameFr, String nameAr, String supplierCode, String categoryCode,
                         Integer qty, BigDecimal salePrice, BigDecimal costPrice,
                         int confidenceOverall, int confidenceNameFr, int confidencePrice,
                         int confidenceCost, int confidenceCategory) {}

    record ExtractionResult(List<ExtractedLine> lines, String rawJson, boolean requiresManualReview) {}

    ExtractionResult extract(String fileName, String mimeType, byte[] content);
}
