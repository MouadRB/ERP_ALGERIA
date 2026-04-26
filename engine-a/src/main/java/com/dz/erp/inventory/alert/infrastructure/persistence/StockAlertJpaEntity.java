package com.dz.erp.inventory.alert.infrastructure.persistence;

import com.dz.erp.inventory.alert.domain.model.AlertSeverity;
import com.dz.erp.inventory.alert.domain.model.AlertType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "stock_alerts", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class StockAlertJpaEntity {
    @Id
    @Column(length = 36)
    private String alertId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AlertType alertType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AlertSeverity severity;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    @Column(name = "is_active", nullable = false)
    private boolean active;
    private Integer suggestedQuantity;
    @Column(length = 50)
    private String supplierCode;
    private Integer supplierLeadDays;
    @Column(nullable = false)
    private Instant triggeredAt;
    private Instant resolvedAt;
    @Column(length = 100)
    private String resolvedBy;
}
