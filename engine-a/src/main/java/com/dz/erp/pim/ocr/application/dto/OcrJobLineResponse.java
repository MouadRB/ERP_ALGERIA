package com.dz.erp.pim.ocr.application.dto;

import java.math.BigDecimal;

public record OcrJobLineResponse(String lineId, int lineIndex,
                                 String skuCode, String nameFr, String nameAr,
                                 String supplierCode, String categoryCode,
                                 Integer qty, BigDecimal salePrice, BigDecimal costPrice,
                                 int confidenceOverall, int confidenceNameFr,
                                 int confidencePrice, int confidenceCost, int confidenceCategory,
                                 boolean accepted, String productId) {}
