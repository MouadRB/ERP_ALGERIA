package com.dz.erp.pim.variant.application.dto;

import jakarta.validation.constraints.NotBlank;

public record SetVariantAttributeCommand(
    @NotBlank String key,
    @NotBlank String valueFr,
    String valueAr,
    String unit,
    int sortOrder
) {}
