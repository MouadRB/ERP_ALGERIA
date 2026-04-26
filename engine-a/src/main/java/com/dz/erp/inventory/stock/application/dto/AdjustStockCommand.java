package com.dz.erp.inventory.stock.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdjustStockCommand(
    @NotNull int quantityChange,
    @NotBlank String reason
) {}
