package com.dz.erp.pim.pricing.application.dto;
import jakarta.validation.constraints.NotNull; import jakarta.validation.constraints.Positive; import java.math.BigDecimal;
public record SetPriceCommand(@NotNull @Positive BigDecimal priceTtc, String categoryCode) {}
