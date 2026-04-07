package com.dz.erp.pim.product.infrastructure.persistence;

import com.dz.erp.pim.product.domain.model.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductJpaEntity {
    @Id
    @Column(length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column( length = 50)
    private String skuCode;
    @Column(length = 20)
    private String skuStatus;
    @Column(length = 50)
    private String supplierCode;
    @Column(length = 50)
    private String supplierRef;
    @Column(length = 50)
    private String categoryCode;
    @Column(nullable = false, length = 300)
    private String nameFr;
    @Column(length = 300)
    private String nameAr;
    @Column(columnDefinition = "TEXT")
    private String descriptionFr;
    @Column(columnDefinition = "TEXT")
    private String descriptionAr;
    @Column(length = 100)
    private String brand;
    @Column(length = 100)
    private String model;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ProductOrigin origin;
    @Column(length = 20)
    private String barcode;
    private int variantCount;
    private int totalStock;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReturnPolicy returnPolicy;
    @Column(precision = 5, scale = 2)
    private BigDecimal returnRate;
    private int ordersLast30Days;
    @Column(precision = 15, scale = 2)
    private BigDecimal salesLast30Days;
    @Column(precision = 3, scale = 1)
    private BigDecimal qualityScore;
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
