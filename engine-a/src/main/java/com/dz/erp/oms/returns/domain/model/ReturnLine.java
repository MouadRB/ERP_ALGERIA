package com.dz.erp.oms.returns.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public class ReturnLine {

    private final UUID lineId;
    private final String skuCode;
    private final UUID variantId;
    private final int quantity;
    private final BigDecimal refundAmount;
    private final String reasonCode;

    public static ReturnLine create(String skuCode, UUID variantId, int quantity,
                                    BigDecimal refundAmount, String reasonCode) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");
        return new ReturnLine(UUID.randomUUID(), skuCode, variantId, quantity, refundAmount, reasonCode);
    }

    public static ReturnLine reconstitute(UUID lineId, String skuCode, UUID variantId,
                                          int quantity, BigDecimal refundAmount, String reasonCode) {
        return new ReturnLine(lineId, skuCode, variantId, quantity, refundAmount, reasonCode);
    }

    private ReturnLine(UUID lineId, String skuCode, UUID variantId, int quantity,
                       BigDecimal refundAmount, String reasonCode) {
        this.lineId = lineId;
        this.skuCode = skuCode;
        this.variantId = variantId;
        this.quantity = quantity;
        this.refundAmount = refundAmount;
        this.reasonCode = reasonCode;
    }

    public UUID getLineId() { return lineId; }
    public String getSkuCode() { return skuCode; }
    public UUID getVariantId() { return variantId; }
    public int getQuantity() { return quantity; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public String getReasonCode() { return reasonCode; }
}
