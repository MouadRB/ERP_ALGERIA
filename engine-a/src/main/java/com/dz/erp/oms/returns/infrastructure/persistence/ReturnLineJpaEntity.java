package com.dz.erp.oms.returns.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "return_lines",
        schema = "oms_schema",
        indexes = @Index(name = "idx_oms_return_line_return_id", columnList = "return_id"))
@Getter
@Setter
@NoArgsConstructor
public class ReturnLineJpaEntity {

    @Id
    @Column(name = "line_id", nullable = false, updatable = false)
    private UUID lineId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "return_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_oms_return_line_request"))
    private ReturnRequestJpaEntity request;

    @Column(name = "sku_code", nullable = false, length = 80)
    private String skuCode;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "refund_amount", precision = 18, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "reason_code", length = 60)
    private String reasonCode;
}
