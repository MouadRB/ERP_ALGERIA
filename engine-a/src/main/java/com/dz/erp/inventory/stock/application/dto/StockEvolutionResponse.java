package com.dz.erp.inventory.stock.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record StockEvolutionResponse(
    List<DailyStock> data,
    int maxQuantity,
    int minQuantity,
    BigDecimal avgQuantity
) {
    public record DailyStock(LocalDate date, int quantity) {}
}
