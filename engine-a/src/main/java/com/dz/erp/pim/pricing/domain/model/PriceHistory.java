package com.dz.erp.pim.pricing.domain.model;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
public class PriceHistory {
    private final String historyId;
    private final String productId;
    private final String tenantId;
    private final String changeType;
    private final BigDecimal oldValue;
    private final BigDecimal newValue;
    private final String currency;
    private final String changedBy;
    private final Instant changedAt;

    public PriceHistory(String productId, String tenantId, String changeType, BigDecimal oldValue, BigDecimal newValue, String changedBy) {
        this.historyId = UUID.randomUUID().toString();
        this.productId = productId;
        this.tenantId = tenantId;
        this.changeType = changeType;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.currency = "DZD";
        this.changedBy = changedBy;
        this.changedAt = Instant.now();
    }
}
