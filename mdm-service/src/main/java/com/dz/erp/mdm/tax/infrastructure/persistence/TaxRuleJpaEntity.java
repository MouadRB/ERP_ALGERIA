package com.dz.erp.mdm.tax.infrastructure.persistence;

import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tax_rules")
@Getter
@Setter
@NoArgsConstructor
public class TaxRuleJpaEntity {
    @Id
    @Column(length = 50)
    private String taxRuleCode;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 50)
    private String categoryCode;
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;
    @Column(length = 200)
    private String description;
    @Column(nullable = false)
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaxRuleStatus status;
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
