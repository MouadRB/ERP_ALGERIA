package com.dz.erp.inventory.returns.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateReturnCommand(
    @NotBlank String skuCode,
    @NotBlank String orderId,
    String customerRef,
    @NotBlank String returnReason,
    @NotBlank String productCondition,
    @Min(1) int quantity
) {}
