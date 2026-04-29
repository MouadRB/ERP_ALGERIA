package com.dz.erp.pim.ocr.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record CommitOcrLine(@NotBlank String lineId,
                            String skuCode,
                            String nameFr,
                            String nameAr,
                            String supplierCode,
                            String categoryCode,
                            @PositiveOrZero Integer qty,
                            BigDecimal salePrice,
                            BigDecimal costPrice) {}
