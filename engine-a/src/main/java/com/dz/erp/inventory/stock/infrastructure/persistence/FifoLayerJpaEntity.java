package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.FifoLayerStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "fifo_layers", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class FifoLayerJpaEntity {
    @Id
    @Column(length = 36)
    private String layerId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Column(nullable = false)
    private int layerNumber;
    @Column(nullable = false)
    private Instant receptionDate;
    @Column(length = 50)
    private String purchaseOrderRef;
    @Column(length = 50)
    private String supplierCode;
    @Column(nullable = false)
    private int initialQuantity;
    @Column(nullable = false)
    private int remainingQuantity;
    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal unitCost;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FifoLayerStatus status;
    @Column(nullable = false)
    private Instant createdAt;
    private Instant depletedAt;
}
