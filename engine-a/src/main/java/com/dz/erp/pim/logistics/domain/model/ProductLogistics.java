package com.dz.erp.pim.logistics.domain.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@EqualsAndHashCode(of = {"productId", "tenantId"})
public class ProductLogistics {

    private final String productId;
    private final String tenantId;

    // ── Stock Settings ──
    private int stockAlertThreshold;
    private int reorderQuantity;
    private int reorderLeadDays;
    private boolean autoReorderEnabled;

    // ── Dimensions (used by carriers: Yalidine, Maystro, Ecotrack, Procolis) ──
    private BigDecimal weightGrams;
    private BigDecimal lengthCm;
    private BigDecimal widthCm;
    private BigDecimal heightCm;

    // ── Packaging ──
    private BigDecimal packagingWeightGrams;
    private String packagingType;
    private boolean fragile;

    private long version;

    // ── Factory: new logistics with defaults ──
    public static ProductLogistics create(String productId, String tenantId) {
        return new ProductLogistics(productId, tenantId,
                10, 50, 7, false,
                null, null, null, null, null, null, false, 0);
    }

    // ── Factory: reconstitute from DB ──
    public static ProductLogistics reconstitute(String productId, String tenantId,
                                                int stockAlertThreshold, int reorderQuantity,
                                                int reorderLeadDays, boolean autoReorderEnabled,
                                                BigDecimal weightGrams, BigDecimal lengthCm,
                                                BigDecimal widthCm, BigDecimal heightCm,
                                                BigDecimal packagingWeightGrams, String packagingType,
                                                boolean fragile, long version) {
        return new ProductLogistics(productId, tenantId,
                stockAlertThreshold, reorderQuantity, reorderLeadDays, autoReorderEnabled,
                weightGrams, lengthCm, widthCm, heightCm,
                packagingWeightGrams, packagingType, fragile, version);
    }

    private ProductLogistics(String productId, String tenantId,
                             int stockAlertThreshold, int reorderQuantity,
                             int reorderLeadDays, boolean autoReorderEnabled,
                             BigDecimal weightGrams, BigDecimal lengthCm,
                             BigDecimal widthCm, BigDecimal heightCm,
                             BigDecimal packagingWeightGrams, String packagingType,
                             boolean fragile, long version) {
        this.productId = productId;
        this.tenantId = tenantId;
        this.stockAlertThreshold = stockAlertThreshold;
        this.reorderQuantity = reorderQuantity;
        this.reorderLeadDays = reorderLeadDays;
        this.autoReorderEnabled = autoReorderEnabled;
        this.weightGrams = weightGrams;
        this.lengthCm = lengthCm;
        this.widthCm = widthCm;
        this.heightCm = heightCm;
        this.packagingWeightGrams = packagingWeightGrams;
        this.packagingType = packagingType;
        this.fragile = fragile;
        this.version = version;
    }

    // ── Calculated fields ──

    public BigDecimal getVolumeCm3() {
        if (lengthCm != null && widthCm != null && heightCm != null)
            return lengthCm.multiply(widthCm).multiply(heightCm);
        return null;
    }

    public BigDecimal getShippingWeightGrams() {
        if (weightGrams == null) return null;
        return weightGrams.add(packagingWeightGrams != null ? packagingWeightGrams : BigDecimal.ZERO);
    }

    // ── Mutation methods ──

    public void updateStockSettings(Integer stockAlertThreshold, Integer reorderQuantity,
                                    Integer reorderLeadDays, Boolean autoReorderEnabled) {
        if (stockAlertThreshold != null) this.stockAlertThreshold = stockAlertThreshold;
        if (reorderQuantity != null) this.reorderQuantity = reorderQuantity;
        if (reorderLeadDays != null) this.reorderLeadDays = reorderLeadDays;
        if (autoReorderEnabled != null) this.autoReorderEnabled = autoReorderEnabled;
    }

    public void updateDimensions(BigDecimal weightGrams, BigDecimal lengthCm,
                                 BigDecimal widthCm, BigDecimal heightCm) {
        if (weightGrams != null) this.weightGrams = weightGrams;
        if (lengthCm != null) this.lengthCm = lengthCm;
        if (widthCm != null) this.widthCm = widthCm;
        if (heightCm != null) this.heightCm = heightCm;
    }

    public void updatePackaging(BigDecimal packagingWeightGrams, String packagingType, Boolean fragile) {
        if (packagingWeightGrams != null) this.packagingWeightGrams = packagingWeightGrams;
        if (packagingType != null) this.packagingType = packagingType;
        if (fragile != null) this.fragile = fragile;
    }
}
