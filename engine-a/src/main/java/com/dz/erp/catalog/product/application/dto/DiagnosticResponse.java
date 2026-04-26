package com.dz.erp.catalog.product.application.dto;
import com.dz.erp.catalog.product.domain.util.DiagnosticResult;
import java.math.BigDecimal;
import java.util.List;
public record DiagnosticResponse(
    String skuCode, BigDecimal totalScore,
    List<DiagnosticResult.Check> checks,
    String verdict
) {}
