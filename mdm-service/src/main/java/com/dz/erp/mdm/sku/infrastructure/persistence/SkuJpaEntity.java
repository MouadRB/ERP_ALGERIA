package com.dz.erp.mdm.sku.infrastructure.persistence;

import com.dz.erp.mdm.sku.domain.model.ProductType;
import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "skus")
@Getter
@Setter
@NoArgsConstructor
public class SkuJpaEntity {
    @Id
    @Column(length = 50)
    private String skuCode;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 20)
    private String baseUom;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductType productType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkuStatus status;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 100)
    private String updatedBy;
    @Column(length = 100)
    private Instant updatedAt;
    @Version
    private long version;
}
