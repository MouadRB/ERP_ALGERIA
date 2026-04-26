package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record StockRecordResponse(
    String stockRecordId, String tenantId, String skuCode,
    String productId, String variantId,
    int totalQuantity, int softReserved, int hardReserved, int quarantine,
    int available, int reorderThreshold, int reorderQuantity,
    boolean trackable, boolean frozen, String status,
    BigDecimal fifoValuation, BigDecimal weightedAvgCost,
    BigDecimal stockValue,
    Instant createdAt, Instant updatedAt, long version
) {}
