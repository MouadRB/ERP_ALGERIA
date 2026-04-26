package com.dz.erp.oms.order.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * OrderLine — a single SKU on an Order. Part of the {@link Order} aggregate.
 *
 * <p>Name and price fields are <b>snapshots</b> captured at intake (see
 * {@code docs/OMS_MODULE.md} §4.1). PIM/Catalog prices may change after the
 * order is placed — OMS never re-reads them.
 *
 * <p>{@code reservationId} starts {@code null} and is populated after Stage 2
 * when Inventory issues a SOFT reservation.
 */
public class OrderLine {

    private final UUID orderLineId;
    private final String skuCode;
    private final UUID variantId;
    private final String productNameSnapshotFr;
    private final String productNameSnapshotAr;
    private final BigDecimal unitPriceHt;
    private final BigDecimal unitPriceTtc;
    private final String taxRuleCode;
    private final int quantity;
    private final BigDecimal lineTotalTtc;
    private UUID reservationId;

    public static OrderLine create(String skuCode, UUID variantId,
                                   String productNameSnapshotFr, String productNameSnapshotAr,
                                   BigDecimal unitPriceHt, BigDecimal unitPriceTtc,
                                   String taxRuleCode, int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");
        var lineTotal = unitPriceTtc.multiply(BigDecimal.valueOf(quantity));
        return new OrderLine(UUID.randomUUID(), skuCode, variantId,
                productNameSnapshotFr, productNameSnapshotAr,
                unitPriceHt, unitPriceTtc, taxRuleCode, quantity, lineTotal, null);
    }

    public static OrderLine reconstitute(UUID orderLineId, String skuCode, UUID variantId,
                                         String productNameSnapshotFr, String productNameSnapshotAr,
                                         BigDecimal unitPriceHt, BigDecimal unitPriceTtc,
                                         String taxRuleCode, int quantity,
                                         BigDecimal lineTotalTtc, UUID reservationId) {
        return new OrderLine(orderLineId, skuCode, variantId,
                productNameSnapshotFr, productNameSnapshotAr,
                unitPriceHt, unitPriceTtc, taxRuleCode, quantity, lineTotalTtc, reservationId);
    }

    private OrderLine(UUID orderLineId, String skuCode, UUID variantId,
                      String productNameSnapshotFr, String productNameSnapshotAr,
                      BigDecimal unitPriceHt, BigDecimal unitPriceTtc, String taxRuleCode,
                      int quantity, BigDecimal lineTotalTtc, UUID reservationId) {
        this.orderLineId = orderLineId;
        this.skuCode = skuCode;
        this.variantId = variantId;
        this.productNameSnapshotFr = productNameSnapshotFr;
        this.productNameSnapshotAr = productNameSnapshotAr;
        this.unitPriceHt = unitPriceHt;
        this.unitPriceTtc = unitPriceTtc;
        this.taxRuleCode = taxRuleCode;
        this.quantity = quantity;
        this.lineTotalTtc = lineTotalTtc;
        this.reservationId = reservationId;
    }

    void attachReservation(UUID reservationId) {
        this.reservationId = reservationId;
    }

    public UUID getOrderLineId() { return orderLineId; }
    public String getSkuCode() { return skuCode; }
    public UUID getVariantId() { return variantId; }
    public String getProductNameSnapshotFr() { return productNameSnapshotFr; }
    public String getProductNameSnapshotAr() { return productNameSnapshotAr; }
    public BigDecimal getUnitPriceHt() { return unitPriceHt; }
    public BigDecimal getUnitPriceTtc() { return unitPriceTtc; }
    public String getTaxRuleCode() { return taxRuleCode; }
    public int getQuantity() { return quantity; }
    public BigDecimal getLineTotalTtc() { return lineTotalTtc; }
    public UUID getReservationId() { return reservationId; }
}
