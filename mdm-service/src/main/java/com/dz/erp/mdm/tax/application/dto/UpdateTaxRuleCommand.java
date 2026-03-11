package com.dz.erp.mdm.tax.application.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
public record UpdateTaxRuleCommand(String categoryCode, BigDecimal taxRate, String description,
    LocalDate effectiveFrom, LocalDate effectiveTo) {}
