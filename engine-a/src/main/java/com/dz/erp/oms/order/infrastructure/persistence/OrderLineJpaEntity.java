package com.dz.erp.oms.order.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * JPA entity for a single line on an {@link OrderJpaEntity}.
 *
 * <p>Uses a composite index on {@code order_id} to keep per-order list loads cheap.
 * {@code reservation_id} is nullable until Stage 2 attaches an inventory SOFT reservation.
 */
@Entity
@Table(
        name = "order_lines",
        schema = "oms_schema",
        indexes = @Index(name = "idx_oms_order_lines_order_id", columnList = "order_id")
)
@Getter
@Setter
@NoArgsConstructor
public class OrderLineJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID orderLineId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_oms_order_lines_order"))
    private OrderJpaEntity order;

    @Column(name = "sku_code", nullable = false, length = 80)
    private String skuCode;

    @Column(name = "variant_id", columnDefinition = "uuid")
    private UUID variantId;

    @Column(name = "product_name_fr", length = 300)
    private String productNameSnapshotFr;

    @Column(name = "product_name_ar", length = 300)
    private String productNameSnapshotAr;

    @Column(name = "unit_price_ht", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPriceHt;

    @Column(name = "unit_price_ttc", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPriceTtc;

    @Column(name = "tax_rule_code", length = 40)
    private String taxRuleCode;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "line_total_ttc", nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotalTtc;

    @Column(name = "reservation_id", columnDefinition = "uuid")
    private UUID reservationId;
}
