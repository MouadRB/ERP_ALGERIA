package com.dz.erp.mdm.tax.application.dto;
import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
public record TaxRuleSearchQuery(String categoryCode, TaxRuleStatus status, int page, int size) {
    public TaxRuleSearchQuery { if (size <= 0) size = 25; if (page < 0) page = 0; }
}
