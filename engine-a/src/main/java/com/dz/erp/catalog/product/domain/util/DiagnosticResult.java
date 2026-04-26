package com.dz.erp.catalog.product.domain.util;

import java.math.BigDecimal;
import java.util.List;

public record DiagnosticResult(
    BigDecimal totalScore,
    List<Check> checks
) {
    public record Check(String rule, boolean passed, String detail) {}
}
