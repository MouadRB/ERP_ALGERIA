package com.dz.erp.oms.order.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderLineResponse(
        UUID orderLineId,
        String skuCode,
        UUID variantId,
        String productNameFr,
        String productNameAr,
        BigDecimal unitPriceHt,
        BigDecimal unitPriceTtc,
        String taxRuleCode,
        int quantity,
        BigDecimal lineTotalTtc,
        UUID reservationId
) {}
