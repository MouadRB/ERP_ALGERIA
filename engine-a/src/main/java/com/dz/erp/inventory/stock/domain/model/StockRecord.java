package com.dz.erp.inventory.stock.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
@EqualsAndHashCode(of = {"stockRecordId", "tenantId"})
public class StockRecord {
    private final String stockRecordId;
    private final String tenantId;
    private final String skuCode;
    private String productId;
    private String variantId;
    private int totalQuantity;
    private int softReserved;
    private int hardReserved;
    private int quarantine;
    private int reorderThreshold;
    private int reorderQuantity;
    private boolean trackable;
    private boolean frozen;
    private StockStatus status;
    private BigDecimal fifoValuation;
    private BigDecimal weightedAvgCost;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    // ── Computed ──
    public int getAvailable() {
        return totalQuantity - softReserved - hardReserved - quarantine;
    }

    // ── Factory: create ──
    public static StockRecord create(String tenantId, String skuCode,
                                      String productId, String variantId,
                                      int reorderThreshold, int reorderQuantity,
                                      String createdBy) {
        Objects.requireNonNull(tenantId, "tenantId required");
        Objects.requireNonNull(skuCode, "skuCode required");
        return new StockRecord(UUID.randomUUID().toString(), tenantId, skuCode,
                productId, variantId, 0, 0, 0, 0,
                reorderThreshold, reorderQuantity, true, false,
                StockStatus.OUT_OF_STOCK, BigDecimal.ZERO, BigDecimal.ZERO,
                createdBy, Instant.now(), null, null, 0);
    }

    // ── Factory: reconstitute from DB ──
    public static StockRecord reconstitute(
            String stockRecordId, String tenantId, String skuCode,
            String productId, String variantId,
            int totalQuantity, int softReserved, int hardReserved, int quarantine,
            int reorderThreshold, int reorderQuantity, boolean trackable, boolean frozen,
            StockStatus status, BigDecimal fifoValuation, BigDecimal weightedAvgCost,
            String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        return new StockRecord(stockRecordId, tenantId, skuCode,
                productId, variantId, totalQuantity, softReserved, hardReserved, quarantine,
                reorderThreshold, reorderQuantity, trackable, frozen,
                status, fifoValuation, weightedAvgCost,
                createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private StockRecord(String stockRecordId, String tenantId, String skuCode,
                         String productId, String variantId,
                         int totalQuantity, int softReserved, int hardReserved, int quarantine,
                         int reorderThreshold, int reorderQuantity, boolean trackable, boolean frozen,
                         StockStatus status, BigDecimal fifoValuation, BigDecimal weightedAvgCost,
                         String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        this.stockRecordId = stockRecordId;
        this.tenantId = tenantId;
        this.skuCode = skuCode;
        this.productId = productId;
        this.variantId = variantId;
        this.totalQuantity = totalQuantity;
        this.softReserved = softReserved;
        this.hardReserved = hardReserved;
        this.quarantine = quarantine;
        this.reorderThreshold = reorderThreshold;
        this.reorderQuantity = reorderQuantity;
        this.trackable = trackable;
        this.frozen = frozen;
        this.status = status;
        this.fifoValuation = fifoValuation;
        this.weightedAvgCost = weightedAvgCost;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    // ── Business Methods ──

    public void receiveStock(int quantity, String actorId) {
        if (frozen) throw new BusinessException(ErrorCode.STOCK_FROZEN);
        if (quantity <= 0) throw new BusinessException(ErrorCode.STOCK_INVALID_QUANTITY);
        this.totalQuantity += quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void softReserve(int quantity, String actorId) {
        if (frozen) throw new BusinessException(ErrorCode.STOCK_FROZEN);
        if (quantity > getAvailable())
            throw new BusinessException(ErrorCode.STOCK_INSUFFICIENT);
        this.softReserved += quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void upgradeSoftToHard(int quantity, String actorId) {
        if (quantity > softReserved)
            throw new BusinessException(ErrorCode.STOCK_INSUFFICIENT_SOFT_RESERVE);
        this.softReserved -= quantity;
        this.hardReserved += quantity;
        touch(actorId);
    }

    public void releaseSoftReserve(int quantity, String actorId) {
        this.softReserved = Math.max(0, this.softReserved - quantity);
        recalculateStatus();
        touch(actorId);
    }

    public void releaseHardReserve(int quantity, String actorId) {
        this.hardReserved = Math.max(0, this.hardReserved - quantity);
        recalculateStatus();
        touch(actorId);
    }

    public void ship(int quantity, String actorId) {
        if (quantity > hardReserved)
            throw new BusinessException(ErrorCode.STOCK_INSUFFICIENT_HARD_RESERVE);
        this.hardReserved -= quantity;
        this.totalQuantity -= quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void addQuarantine(int quantity, String actorId) {
        this.totalQuantity += quantity;
        this.quarantine += quantity;
        touch(actorId);
    }

    public void approveReturn(int quantity, String actorId) {
        this.quarantine -= quantity;
        // remains in totalQuantity -- now becomes available
        recalculateStatus();
        touch(actorId);
    }

    public void rejectReturn(int quantity, String actorId) {
        this.quarantine -= quantity;
        this.totalQuantity -= quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void adjustIn(int quantity, String actorId) {
        this.totalQuantity += quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void adjustOut(int quantity, String actorId) {
        this.totalQuantity -= quantity;
        recalculateStatus();
        touch(actorId);
    }

    public void freeze() { this.frozen = true; }
    public void markTrackable() { this.trackable = true; }

    public boolean isBelowThreshold() {
        return getAvailable() > 0 && getAvailable() <= reorderThreshold;
    }

    public boolean isOutOfStock() { return getAvailable() <= 0; }

    public void updateFifoValuation(BigDecimal valuation, BigDecimal weightedAvg) {
        this.fifoValuation = valuation;
        this.weightedAvgCost = weightedAvg;
    }

    public void updateThresholds(int reorderThreshold, int reorderQuantity, String actorId) {
        this.reorderThreshold = reorderThreshold;
        this.reorderQuantity = reorderQuantity;
        recalculateStatus();
        touch(actorId);
    }

    private void recalculateStatus() {
        if (getAvailable() <= 0) this.status = StockStatus.OUT_OF_STOCK;
        else if (getAvailable() <= reorderThreshold) this.status = StockStatus.LOW_STOCK;
        else this.status = StockStatus.IN_STOCK;
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}
