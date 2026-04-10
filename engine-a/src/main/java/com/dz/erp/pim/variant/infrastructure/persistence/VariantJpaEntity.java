package com.dz.erp.pim.variant.infrastructure.persistence;

import com.dz.erp.pim.variant.domain.model.VariantStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "variants", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class VariantJpaEntity {
    @Id
    @Column(length = 36)
    private String variantId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Column(length = 200)
    private String label;
    @Column(length = 20)
    private String barcode;
    @Column(precision = 15, scale = 2)
    private BigDecimal priceOverride;
    @Column(precision = 15, scale = 2)
    private BigDecimal costOverride;
    private int stockQuantity;
    private int stockThreshold;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VariantStatus status;
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
