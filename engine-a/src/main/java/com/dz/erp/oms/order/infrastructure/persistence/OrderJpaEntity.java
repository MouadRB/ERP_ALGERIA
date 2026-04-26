package com.dz.erp.oms.order.infrastructure.persistence;

import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.domain.model.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA entity for the Order aggregate root.
 *
 * <p>Lines and status-history rows cascade through this entity. The
 * {@code (tenant_id, channel_code, idempotency_key)} uniqueness constraint is what
 * makes idempotent re-submission cheap — a second call with the same key never reaches
 * the intake service because {@code findByIdempotencyKey} short-circuits.
 */
@Entity
@Table(
        name = "orders",
        schema = "oms_schema",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_oms_orders_tenant_channel_idempotency",
                columnNames = {"tenant_id", "channel_code", "idempotency_key"}),
        indexes = {
                @Index(name = "idx_oms_orders_tenant_status", columnList = "tenant_id,status"),
                @Index(name = "idx_oms_orders_tenant_placed_at", columnList = "tenant_id,placed_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class OrderJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID orderId;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "channel_code", nullable = false, length = 50)
    private String channelCode;

    @Column(name = "external_order_ref", length = 100)
    private String externalOrderRef;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(name = "customer_id", nullable = false, length = 100)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 10)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "subtotal_ht", nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotalHt;

    @Column(name = "tax_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal taxTotal;

    @Column(name = "shipping_fee", nullable = false, precision = 14, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "grand_total_ttc", nullable = false, precision = 14, scale = 2)
    private BigDecimal grandTotalTtc;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "recipientName", column = @Column(name = "ship_recipient_name", length = 200)),
            @AttributeOverride(name = "phone",         column = @Column(name = "ship_phone", length = 40)),
            @AttributeOverride(name = "wilayaCode",    column = @Column(name = "ship_wilaya_code", length = 2)),
            @AttributeOverride(name = "commune",       column = @Column(name = "ship_commune", length = 100)),
            @AttributeOverride(name = "line1",         column = @Column(name = "ship_line1", length = 255)),
            @AttributeOverride(name = "line2",         column = @Column(name = "ship_line2", length = 255)),
            @AttributeOverride(name = "postalCode",    column = @Column(name = "ship_postal_code", length = 20)),
            @AttributeOverride(name = "notes",         column = @Column(name = "ship_notes", length = 500))
    })
    private AddressEmbeddable shippingAddress;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "recipientName", column = @Column(name = "bill_recipient_name", length = 200)),
            @AttributeOverride(name = "phone",         column = @Column(name = "bill_phone", length = 40)),
            @AttributeOverride(name = "wilayaCode",    column = @Column(name = "bill_wilaya_code", length = 2)),
            @AttributeOverride(name = "commune",       column = @Column(name = "bill_commune", length = 100)),
            @AttributeOverride(name = "line1",         column = @Column(name = "bill_line1", length = 255)),
            @AttributeOverride(name = "line2",         column = @Column(name = "bill_line2", length = 255)),
            @AttributeOverride(name = "postalCode",    column = @Column(name = "bill_postal_code", length = 20)),
            @AttributeOverride(name = "notes",         column = @Column(name = "bill_notes", length = 500))
    })
    private AddressEmbeddable billingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderLineJpaEntity> lines = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderStatusHistoryJpaEntity> statusHistory = new ArrayList<>();

    @Column(name = "placed_at", nullable = false)
    private LocalDateTime placedAt;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "rejection_reason_code", length = 60)
    private String rejectionReasonCode;

    @Column(name = "rejection_reason_message", length = 500)
    private String rejectionReasonMessage;

    @Version
    @Column(name = "version")
    private long version;
}
