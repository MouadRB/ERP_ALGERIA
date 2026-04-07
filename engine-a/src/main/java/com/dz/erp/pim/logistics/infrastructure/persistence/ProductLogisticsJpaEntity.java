package com.dz.erp.pim.logistics.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_logistics", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductLogisticsJpaEntity {
    @Id
    @Column(length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    private int stockAlertThreshold;
    private int reorderQuantity;
    private int reorderLeadDays;
    private boolean autoReorderEnabled;
    @Column(precision = 10, scale = 2)
    private BigDecimal weightGrams;
    @Column(precision = 10, scale = 2)
    private BigDecimal lengthCm;
    @Column(precision = 10, scale = 2)
    private BigDecimal widthCm;
    @Column(precision = 10, scale = 2)
    private BigDecimal heightCm;
    @Column(precision = 10, scale = 2)
    private BigDecimal packagingWeightGrams;
    @Column(length = 30)
    private String packagingType;
    private boolean fragile;
    @Version
    private long version;
}
