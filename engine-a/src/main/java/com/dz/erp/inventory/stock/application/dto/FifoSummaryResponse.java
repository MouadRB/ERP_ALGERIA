package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;

public record FifoSummaryResponse(
    int activeLayersCount,
    int totalFifoStock,
    BigDecimal weightedAvgCost,
    BigDecimal totalValue,
    String nextSaleInfo
) {}
