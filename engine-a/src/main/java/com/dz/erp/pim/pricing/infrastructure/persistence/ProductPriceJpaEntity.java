package com.dz.erp.pim.pricing.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "product_prices", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductPriceJpaEntity {
    @Id
    @Column(length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(precision = 15, scale = 2)
    private BigDecimal priceTtc;
    @Column(precision = 15, scale = 2)
    private BigDecimal priceHt;
    @Column(precision = 5, scale = 2)
    private BigDecimal taxRate;
    @Column(precision = 15, scale = 2)
    private BigDecimal tvaAmount;
    @Column(length = 50)
    private String taxRuleCode;
    @Column(precision = 15, scale = 2)
    private BigDecimal costFifo;
    @Column(precision = 15, scale = 2)
    private BigDecimal costWeightedAvg;
    @Column(length = 50)
    private String lastPurchaseOrderRef;
    @Column(precision = 15, scale = 2)
    private BigDecimal marginAmount;
    @Column(precision = 5, scale = 1)
    private BigDecimal marginPercent;
    @Column(length = 100)
    private String updatedBy;
    private Instant updatedAt;
    @Version
    private long version;
}
