package com.dz.erp.mdm.tax.application.dto;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
public record TaxRuleResponse(String taxRuleCode, String tenantId, String categoryCode,
    BigDecimal taxRate, String description, LocalDate effectiveFrom, LocalDate effectiveTo,
    String status, String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {}
