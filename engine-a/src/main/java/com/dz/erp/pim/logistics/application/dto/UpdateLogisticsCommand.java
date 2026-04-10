package com.dz.erp.pim.logistics.application.dto;
import java.math.BigDecimal;
public record UpdateLogisticsCommand(
    Integer stockAlertThreshold, Integer reorderQuantity, Integer reorderLeadDays, Boolean autoReorderEnabled,
    BigDecimal weightGrams, BigDecimal lengthCm, BigDecimal widthCm, BigDecimal heightCm,
    BigDecimal packagingWeightGrams, String packagingType, Boolean fragile
) {}
