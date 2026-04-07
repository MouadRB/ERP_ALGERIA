package com.dz.erp.pim.variant.application.dto;
import java.math.BigDecimal;
public record UpdateVariantCommand(String label, String barcode, BigDecimal priceOverride,
    BigDecimal costOverride, Integer stockThreshold) {}
