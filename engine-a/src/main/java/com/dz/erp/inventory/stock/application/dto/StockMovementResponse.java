package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record StockMovementResponse(
    String movementId, String skuCode, String movementType,
    int quantityChange, int quantityBefore, int quantityAfter,
    BigDecimal unitCost, BigDecimal totalCost,
    String referenceType, String referenceId, String reason,
    String performedBy, Instant performedAt,
    String auditHash
) {}
