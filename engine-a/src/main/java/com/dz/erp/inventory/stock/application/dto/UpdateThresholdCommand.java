package com.dz.erp.inventory.stock.application.dto;

import jakarta.validation.constraints.Min;

public record UpdateThresholdCommand(
    @Min(0) int reorderThreshold,
    @Min(1) int reorderQuantity
) {}
