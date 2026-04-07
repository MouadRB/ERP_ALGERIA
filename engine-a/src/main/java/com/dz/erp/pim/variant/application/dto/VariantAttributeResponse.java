package com.dz.erp.pim.variant.application.dto;

public record VariantAttributeResponse(
    String attributeId,
    String variantId,
    String key,
    String valueFr,
    String valueAr,
    String unit,
    int sortOrder
) {}
