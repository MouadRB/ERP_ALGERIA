package com.dz.erp.pim.variant.application.dto;
import java.math.BigDecimal; import java.time.Instant;
public record VariantResponse(String variantId, String productId, String skuCode, String label,
    String barcode, BigDecimal priceOverride, BigDecimal costOverride,
    int stockQuantity, int stockThreshold, String status,
    String createdBy, Instant createdAt, long version) {}
