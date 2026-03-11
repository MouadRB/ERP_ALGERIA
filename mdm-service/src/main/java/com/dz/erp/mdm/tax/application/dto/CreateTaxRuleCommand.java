package com.dz.erp.mdm.tax.application.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
public record CreateTaxRuleCommand(@NotBlank String taxRuleCode, @NotBlank String categoryCode,
    @NotNull BigDecimal taxRate, String description, @NotNull LocalDate effectiveFrom, LocalDate effectiveTo) {}
