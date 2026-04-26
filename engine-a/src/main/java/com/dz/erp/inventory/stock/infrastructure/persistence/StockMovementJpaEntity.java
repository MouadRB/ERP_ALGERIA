package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.MovementType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "stock_movements", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class StockMovementJpaEntity {
    @Id
    @Column(length = 36)
    private String movementId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MovementType movementType;
    @Column(nullable = false)
    private int quantityChange;
    @Column(nullable = false)
    private int quantityBefore;
    @Column(nullable = false)
    private int quantityAfter;
    @Column(precision = 15, scale = 4)
    private BigDecimal unitCost;
    @Column(precision = 15, scale = 2)
    private BigDecimal totalCost;
    @Column(length = 30)
    private String referenceType;
    @Column(length = 50)
    private String referenceId;
    @Column(columnDefinition = "TEXT")
    private String reason;
    @Column(length = 36)
    private String fifoLayerId;
    @Column(nullable = false, length = 100)
    private String performedBy;
    @Column(nullable = false)
    private Instant performedAt;
    @Column(nullable = false, length = 64)
    private String auditHash;
    @Column(length = 64)
    private String previousHash;
}
