package com.dz.erp.inventory.stock.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

public record BulkMovementCommand(
    @NotEmpty List<String> stockRecordIds,
    @NotBlank String movementType,
    @Min(1) int quantity,
    String purchaseOrderRef,
    String supplierCode,
    BigDecimal unitCost,
    String reason
) {}
