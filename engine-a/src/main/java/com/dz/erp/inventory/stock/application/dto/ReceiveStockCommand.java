package com.dz.erp.inventory.stock.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReceiveStockCommand(
    @NotBlank String stockRecordId,
    @NotBlank String purchaseOrderRef,
    String supplierCode,
    @Min(1) int quantity,
    @NotNull @DecimalMin("0.01") BigDecimal unitCost
) {}
