package com.dz.erp.pim.variant.application.dto;
import jakarta.validation.constraints.NotBlank; import java.math.BigDecimal;
public record CreateVariantCommand(@NotBlank String skuCode, String label, String barcode,
    BigDecimal priceOverride, BigDecimal costOverride, int stockThreshold) {}
