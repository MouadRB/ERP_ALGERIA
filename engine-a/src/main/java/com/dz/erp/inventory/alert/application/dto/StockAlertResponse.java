package com.dz.erp.inventory.alert.application.dto;

import java.time.Instant;

public record StockAlertResponse(
    String alertId, String skuCode, String alertType, String severity,
    String message, boolean active, Integer suggestedQuantity,
    String supplierCode, Integer supplierLeadDays,
    Instant triggeredAt, Instant resolvedAt
) {}
