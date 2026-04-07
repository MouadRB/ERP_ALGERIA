package com.dz.erp.pim.pricing.application.dto;
import java.math.BigDecimal; import java.time.Instant;
public record PriceResponse(String productId, BigDecimal priceTtc, BigDecimal priceHt, BigDecimal taxRate, BigDecimal tvaAmount, String taxRuleCode, BigDecimal costFifo, BigDecimal costWeightedAvg, String lastPurchaseOrderRef, BigDecimal marginAmount, BigDecimal marginPercent, String updatedBy, Instant updatedAt) {}
