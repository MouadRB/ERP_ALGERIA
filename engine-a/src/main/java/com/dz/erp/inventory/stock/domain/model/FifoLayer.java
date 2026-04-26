package com.dz.erp.inventory.stock.domain.model;

import lombok.Getter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
public class FifoLayer {
    private final String layerId;
    private final String tenantId;
    private final String stockRecordId;
    private final String skuCode;
    private final int layerNumber;
    private final Instant receptionDate;
    private final String purchaseOrderRef;
    private final String supplierCode;
    private final int initialQuantity;
    private int remainingQuantity;
    private final BigDecimal unitCost;
    private FifoLayerStatus status;
    private final Instant createdAt;
    private Instant depletedAt;

    public static FifoLayer create(String tenantId, String stockRecordId, String skuCode,
                                    int layerNumber, String poRef, String supplierCode,
                                    int quantity, BigDecimal unitCost) {
        return new FifoLayer(UUID.randomUUID().toString(), tenantId, stockRecordId, skuCode,
                layerNumber, Instant.now(), poRef, supplierCode,
                quantity, quantity, unitCost, FifoLayerStatus.ACTIVE, Instant.now(), null);
    }

    public static FifoLayer reconstitute(String layerId, String tenantId, String stockRecordId,
                                          String skuCode, int layerNumber, Instant receptionDate,
                                          String purchaseOrderRef, String supplierCode,
                                          int initialQuantity, int remainingQuantity,
                                          BigDecimal unitCost, FifoLayerStatus status,
                                          Instant createdAt, Instant depletedAt) {
        return new FifoLayer(layerId, tenantId, stockRecordId, skuCode, layerNumber,
                receptionDate, purchaseOrderRef, supplierCode,
                initialQuantity, remainingQuantity, unitCost, status, createdAt, depletedAt);
    }

    private FifoLayer(String layerId, String tenantId, String stockRecordId, String skuCode,
                       int layerNumber, Instant receptionDate, String purchaseOrderRef,
                       String supplierCode, int initialQuantity, int remainingQuantity,
                       BigDecimal unitCost, FifoLayerStatus status, Instant createdAt, Instant depletedAt) {
        this.layerId = layerId;
        this.tenantId = tenantId;
        this.stockRecordId = stockRecordId;
        this.skuCode = skuCode;
        this.layerNumber = layerNumber;
        this.receptionDate = receptionDate;
        this.purchaseOrderRef = purchaseOrderRef;
        this.supplierCode = supplierCode;
        this.initialQuantity = initialQuantity;
        this.remainingQuantity = remainingQuantity;
        this.unitCost = unitCost;
        this.status = status;
        this.createdAt = createdAt;
        this.depletedAt = depletedAt;
    }

    public BigDecimal getRemainingValue() {
        return unitCost.multiply(BigDecimal.valueOf(remainingQuantity));
    }

    /**
     * Consume units from this layer (FIFO oldest-first).
     * @return actual number consumed (may be less than requested if layer partially depleted)
     */
    public int consume(int requested) {
        int consumed = Math.min(requested, remainingQuantity);
        this.remainingQuantity -= consumed;
        if (this.remainingQuantity == 0) {
            this.status = FifoLayerStatus.DEPLETED;
            this.depletedAt = Instant.now();
        }
        return consumed;
    }
}
