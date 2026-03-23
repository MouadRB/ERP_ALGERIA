package com.dz.erp.pim.pricing.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "price_history", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class PriceHistoryJpaEntity {
    @Id
    @Column(length = 36)
    private String historyId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 30)
    private String changeType;
    @Column(precision = 15, scale = 2)
    private BigDecimal oldValue;
    @Column(precision = 15, scale = 2)
    private BigDecimal newValue;
    @Column(length = 5)
    private String currency;
    @Column(nullable = false, length = 100)
    private String changedBy;
    @Column(nullable = false)
    private Instant changedAt;
}
