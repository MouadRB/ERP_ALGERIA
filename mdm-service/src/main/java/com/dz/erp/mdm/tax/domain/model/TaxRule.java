package com.dz.erp.mdm.tax.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Getter
@EqualsAndHashCode(of = {"taxRuleCode", "tenantId"})
public class TaxRule {
    private final String taxRuleCode;
    private final String tenantId;
    private String categoryCode;
    private BigDecimal taxRate;
    private String description;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private TaxRuleStatus status;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static TaxRule create(String taxRuleCode, String tenantId, String categoryCode,
                                 BigDecimal taxRate, String description, LocalDate effectiveFrom,
                                 LocalDate effectiveTo, String createdBy) {
        Objects.requireNonNull(taxRuleCode);
        Objects.requireNonNull(categoryCode);
        Objects.requireNonNull(taxRate);
        Objects.requireNonNull(effectiveFrom);
        if (taxRate.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Tax rate cannot be negative");
        return new TaxRule(taxRuleCode.trim().toUpperCase(), tenantId, categoryCode.trim().toUpperCase(),
                taxRate, description, effectiveFrom, effectiveTo, TaxRuleStatus.DRAFT,
                Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static TaxRule reconstitute(String taxRuleCode, String tenantId, String categoryCode,
                                       BigDecimal taxRate, String description, LocalDate effectiveFrom, LocalDate effectiveTo,
                                       TaxRuleStatus status, String createdBy, Instant createdAt,
                                       String updatedBy, Instant updatedAt, long version) {
        return new TaxRule(taxRuleCode, tenantId, categoryCode, taxRate, description,
                effectiveFrom, effectiveTo, status, createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private TaxRule(String taxRuleCode, String tenantId, String categoryCode, BigDecimal taxRate,
                    String description, LocalDate effectiveFrom, LocalDate effectiveTo,
                    TaxRuleStatus status, String createdBy, Instant createdAt,
                    String updatedBy, Instant updatedAt, long version) {
        this.taxRuleCode = taxRuleCode;
        this.tenantId = tenantId;
        this.categoryCode = categoryCode;
        this.taxRate = taxRate;
        this.description = description;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void activate(String activatorId) {
        if (status != TaxRuleStatus.DRAFT)
            throw new BusinessException(ErrorCode.TAX_RULE_INVALID_TRANSITION, status, TaxRuleStatus.ACTIVE);
        if (createdBy.equals(activatorId)) throw new BusinessException(ErrorCode.TAX_RULE_SOD_VIOLATION);
        this.status = TaxRuleStatus.ACTIVE;
        touch(activatorId);
    }

    public void archive(String actorId) {
        if (status != TaxRuleStatus.ACTIVE)
            throw new BusinessException(ErrorCode.TAX_RULE_INVALID_TRANSITION, status, TaxRuleStatus.ARCHIVED);
        this.status = TaxRuleStatus.ARCHIVED;
        this.effectiveTo = LocalDate.now();
        touch(actorId);
    }

    public void update(String categoryCode, BigDecimal taxRate, String description,
                       LocalDate effectiveFrom, LocalDate effectiveTo, String actorId) {
        if (status != TaxRuleStatus.DRAFT) throw new BusinessException(ErrorCode.TAX_RULE_NOT_EDITABLE);
        if (categoryCode != null) this.categoryCode = categoryCode;
        if (taxRate != null) this.taxRate = taxRate;
        if (description != null) this.description = description;
        if (effectiveFrom != null) this.effectiveFrom = effectiveFrom;
        if (effectiveTo != null) this.effectiveTo = effectiveTo;
        touch(actorId);
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}
