package com.dz.erp.pim.pricing.application.dto;
import java.math.BigDecimal; import java.time.Instant;
public record PriceHistoryResponse(String historyId, String changeType, BigDecimal oldValue, BigDecimal newValue, String currency, String changedBy, Instant changedAt) {}
