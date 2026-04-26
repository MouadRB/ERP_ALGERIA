package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;

public record StockDashboardResponse(
    BigDecimal totalFifoValuation,
    int outOfStockCount,
    int belowThresholdCount,
    int totalSoftReserved,
    int totalHardReserved,
    int movementsTodayIn,
    int movementsTodayOut,
    int totalVariants
) {}
