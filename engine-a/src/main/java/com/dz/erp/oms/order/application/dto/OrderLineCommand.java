package com.dz.erp.oms.order.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Inbound order line. Prices are <b>authoritative from the channel submission</b> —
 * OMS snapshots them (§4.1); it does not recompute from PIM.
 */
public record OrderLineCommand(
        @NotBlank String skuCode,
        UUID variantId,
        String productNameFr,
        String productNameAr,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal unitPriceHt,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal unitPriceTtc,
        String taxRuleCode,
        @Min(1) int quantity
) {}
