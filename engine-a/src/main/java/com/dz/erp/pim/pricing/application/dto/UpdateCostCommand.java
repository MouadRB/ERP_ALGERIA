package com.dz.erp.pim.pricing.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

/**
 * Sent by Procurement after goods receipt.
 * Procurement calculates FIFO and weighted avg — PIM just stores the result.
 */
public record UpdateCostCommand(
    @NotNull @Positive BigDecimal fifoCost,
    @Positive BigDecimal weightedAvgCost,
    @NotBlank String purchaseOrderRef
) {}
