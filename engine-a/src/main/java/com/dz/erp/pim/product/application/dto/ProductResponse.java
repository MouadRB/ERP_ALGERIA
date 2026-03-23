package com.dz.erp.pim.product.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(String productId, String tenantId, String skuCode, String skuStatus,
                              String supplierCode, String supplierRef, String categoryCode,
                              String nameFr, String nameAr, String descriptionFr, String descriptionAr,
                              String brand, String model, String origin, String barcode,
                              int variantCount, int totalStock, String status, String returnPolicy,
                              BigDecimal returnRate, int ordersLast30Days, BigDecimal salesLast30Days,
                              BigDecimal qualityScore, boolean flagged, boolean skuActivationBlocked,
                              String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
}
