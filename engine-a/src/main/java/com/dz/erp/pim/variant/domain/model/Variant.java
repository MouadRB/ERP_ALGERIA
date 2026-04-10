package com.dz.erp.pim.variant.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"variantId"})
public class Variant {
    private final String variantId;
    private final String productId;
    private final String tenantId;
    private String skuCode;
    private String label;
    private String barcode;
    private BigDecimal priceOverride;
    private BigDecimal costOverride;
    private int stockQuantity;
    private int stockThreshold;
    private VariantStatus status;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static Variant create(String productId, String tenantId, String skuCode, String label,
                                 String barcode, BigDecimal priceOverride, BigDecimal costOverride,
                                 int stockThreshold, String createdBy) {
        return new Variant(UUID.randomUUID().toString(), productId, tenantId,
                Objects.requireNonNull(skuCode).trim().toUpperCase(), label, barcode,
                priceOverride, costOverride, 0, stockThreshold, VariantStatus.ACTIVE,
                Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static Variant reconstitute(String variantId, String productId, String tenantId,
                                       String skuCode, String label, String barcode,
                                       BigDecimal priceOverride, BigDecimal costOverride,
                                       int stockQuantity, int stockThreshold, VariantStatus status,
                                       String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        return new Variant(variantId, productId, tenantId, skuCode, label, barcode,
                priceOverride, costOverride, stockQuantity, stockThreshold, status,
                createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private Variant(String variantId, String productId, String tenantId, String skuCode,
                    String label, String barcode, BigDecimal priceOverride, BigDecimal costOverride,
                    int stockQuantity, int stockThreshold, VariantStatus status,
                    String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        this.variantId = variantId;
        this.productId = productId;
        this.tenantId = tenantId;
        this.skuCode = skuCode;
        this.label = label;
        this.barcode = barcode;
        this.priceOverride = priceOverride;
        this.costOverride = costOverride;
        this.stockQuantity = stockQuantity;
        this.stockThreshold = stockThreshold;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void update(String label, String barcode, BigDecimal priceOverride, BigDecimal costOverride, Integer stockThreshold, String actorId) {
        if (label != null) this.label = label;
        if (barcode != null) this.barcode = barcode;
        this.priceOverride = priceOverride;
        this.costOverride = costOverride;
        if (stockThreshold != null) this.stockThreshold = stockThreshold;
        touch(actorId);
    }

    public void updateStockFromInventory(int quantity) {
        this.stockQuantity = quantity;
        this.status = quantity <= 0 ? VariantStatus.OUT_OF_STOCK : VariantStatus.ACTIVE;
    }

    public void discontinue(String actorId) {
        this.status = VariantStatus.DISCONTINUED;
        touch(actorId);
    }

    public void activate(int newQuantity) {
        if (newQuantity <= 0) {
            this.status = VariantStatus.OUT_OF_STOCK;
        } else {
            this.status = VariantStatus.ACTIVE;
        }
    }

    public boolean hasStock() {
        return stockQuantity > 0;
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}
