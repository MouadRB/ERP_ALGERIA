package com.dz.erp.pim.logistics.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record LogisticsResponse(
    String productId,
    // Stock settings
    int stockAlertThreshold,
    int reorderQuantity,
    int reorderLeadDays,
    boolean autoReorderEnabled,
    // Dimensions
    BigDecimal weightGrams,
    BigDecimal lengthCm,
    BigDecimal widthCm,
    BigDecimal heightCm,
    BigDecimal volumeCm3,
    // Packaging
    BigDecimal packagingWeightGrams,
    BigDecimal shippingWeightGrams,
    String packagingType,
    boolean fragile,
    // Restrictions
    List<WilayaRestrictionResponse> restrictions
) {}
