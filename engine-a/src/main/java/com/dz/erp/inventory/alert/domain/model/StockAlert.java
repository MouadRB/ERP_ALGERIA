package com.dz.erp.inventory.alert.domain.model;

import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Getter
public class StockAlert {
    private final String alertId;
    private final String tenantId;
    private final String stockRecordId;
    private final String skuCode;
    private final AlertType alertType;
    private final AlertSeverity severity;
    private final String message;
    private boolean active;
    private final Integer suggestedQuantity;
    private final String supplierCode;
    private final Integer supplierLeadDays;
    private final Instant triggeredAt;
    private Instant resolvedAt;
    private String resolvedBy;

    public static StockAlert create(String tenantId, String stockRecordId, String skuCode,
                                     AlertType alertType, AlertSeverity severity, String message,
                                     Integer suggestedQuantity, String supplierCode, Integer supplierLeadDays) {
        return new StockAlert(UUID.randomUUID().toString(), tenantId, stockRecordId, skuCode,
                alertType, severity, message, true,
                suggestedQuantity, supplierCode, supplierLeadDays,
                Instant.now(), null, null);
    }

    public static StockAlert reconstitute(
            String alertId, String tenantId, String stockRecordId, String skuCode,
            AlertType alertType, AlertSeverity severity, String message, boolean active,
            Integer suggestedQuantity, String supplierCode, Integer supplierLeadDays,
            Instant triggeredAt, Instant resolvedAt, String resolvedBy) {
        return new StockAlert(alertId, tenantId, stockRecordId, skuCode,
                alertType, severity, message, active,
                suggestedQuantity, supplierCode, supplierLeadDays,
                triggeredAt, resolvedAt, resolvedBy);
    }

    private StockAlert(String alertId, String tenantId, String stockRecordId, String skuCode,
                        AlertType alertType, AlertSeverity severity, String message, boolean active,
                        Integer suggestedQuantity, String supplierCode, Integer supplierLeadDays,
                        Instant triggeredAt, Instant resolvedAt, String resolvedBy) {
        this.alertId = alertId;
        this.tenantId = tenantId;
        this.stockRecordId = stockRecordId;
        this.skuCode = skuCode;
        this.alertType = alertType;
        this.severity = severity;
        this.message = message;
        this.active = active;
        this.suggestedQuantity = suggestedQuantity;
        this.supplierCode = supplierCode;
        this.supplierLeadDays = supplierLeadDays;
        this.triggeredAt = triggeredAt;
        this.resolvedAt = resolvedAt;
        this.resolvedBy = resolvedBy;
    }

    public void resolve(String resolvedBy) {
        this.active = false;
        this.resolvedAt = Instant.now();
        this.resolvedBy = resolvedBy;
    }
}
