package com.dz.erp.pim.pricing.domain.model;

import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Getter
public class ProductPrice {
    private final String productId;
    private final String tenantId;
    private BigDecimal priceTtc;
    private BigDecimal priceHt;
    private BigDecimal taxRate;
    private BigDecimal tvaAmount;
    private String taxRuleCode;
    private BigDecimal costFifo;
    private BigDecimal costWeightedAvg;
    private String lastPurchaseOrderRef;
    private BigDecimal marginAmount;
    private BigDecimal marginPercent;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static ProductPrice create(String productId, String tenantId, BigDecimal priceTtc, BigDecimal taxRate, String taxRuleCode, String createdBy) {
        var p = new ProductPrice(productId, tenantId);
        p.setPrice(priceTtc, taxRate, taxRuleCode, createdBy);
        return p;
    }

    public static ProductPrice reconstitute(String productId, String tenantId, BigDecimal priceTtc, BigDecimal priceHt, BigDecimal taxRate, BigDecimal tvaAmount, String taxRuleCode, BigDecimal costFifo, BigDecimal costWeightedAvg, String lastPurchaseOrderRef, BigDecimal marginAmount, BigDecimal marginPercent, String updatedBy, Instant updatedAt, long version) {
        var p = new ProductPrice(productId, tenantId);
        p.priceTtc = priceTtc;
        p.priceHt = priceHt;
        p.taxRate = taxRate;
        p.tvaAmount = tvaAmount;
        p.taxRuleCode = taxRuleCode;
        p.costFifo = costFifo;
        p.costWeightedAvg = costWeightedAvg;
        p.lastPurchaseOrderRef = lastPurchaseOrderRef;
        p.marginAmount = marginAmount;
        p.marginPercent = marginPercent;
        p.updatedBy = updatedBy;
        p.updatedAt = updatedAt;
        p.version = version;
        return p;
    }

    private ProductPrice(String productId, String tenantId) {
        this.productId = productId;
        this.tenantId = tenantId;
    }

    public void setPrice(BigDecimal priceTtc, BigDecimal taxRate, String taxRuleCode, String actorId) {
        this.priceTtc = priceTtc;
        this.taxRate = taxRate;
        this.taxRuleCode = taxRuleCode;
        var div = BigDecimal.ONE.add(taxRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        this.priceHt = priceTtc.divide(div, 2, RoundingMode.HALF_UP);
        this.tvaAmount = priceTtc.subtract(this.priceHt);
        recalcMargin();
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }

    public void updateCost(BigDecimal costFifo, BigDecimal costWeightedAvg, String poRef) {
        this.costFifo = costFifo;
        this.costWeightedAvg = costWeightedAvg;
        this.lastPurchaseOrderRef = poRef;
        recalcMargin();
        this.updatedAt = Instant.now();
    }

    private void recalcMargin() {
        if (priceHt != null && costFifo != null && costFifo.compareTo(BigDecimal.ZERO) > 0) {
            this.marginAmount = priceHt.subtract(costFifo);
            this.marginPercent = marginAmount.divide(priceHt, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(1, RoundingMode.HALF_UP);
        }
    }
}
