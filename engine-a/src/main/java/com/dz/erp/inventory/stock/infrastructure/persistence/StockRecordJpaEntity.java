package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.StockStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "stock_records", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class StockRecordJpaEntity {
    @Id
    @Column(length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Column(length = 36)
    private String productId;
    @Column(length = 36)
    private String variantId;
    @Column(nullable = false)
    private int totalQuantity;
    @Column(nullable = false)
    private int softReserved;
    @Column(nullable = false)
    private int hardReserved;
    @Column(nullable = false)
    private int quarantine;
    @Column(nullable = false)
    private int reorderThreshold;
    @Column(nullable = false)
    private int reorderQuantity;
    @Column(name = "is_trackable", nullable = false)
    private boolean trackable;
    @Column(name = "is_frozen", nullable = false)
    private boolean frozen;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockStatus status;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal fifoValuation;
    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal weightedAvgCost;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 100)
    private String updatedBy;
    private Instant updatedAt;
    @Version
    private long version;
}
