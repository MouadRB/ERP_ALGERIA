package com.dz.erp.pim.product.application.dto;
import java.math.BigDecimal;
public record UpdateSalesStatsCommand(int ordersLast30Days, BigDecimal salesLast30Days, BigDecimal qualityScore) {}
