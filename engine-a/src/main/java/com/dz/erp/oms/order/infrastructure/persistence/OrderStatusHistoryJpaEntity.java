package com.dz.erp.oms.order.infrastructure.persistence;

import com.dz.erp.oms.order.domain.model.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA entity for an {@link com.dz.erp.oms.order.domain.model.OrderStatusHistory} entry.
 *
 * <p>Append-only by convention — no {@code @Version} column because individual rows
 * are never updated. If you find yourself mutating one, write a new row instead.
 */
@Entity
@Table(
        name = "order_status_history",
        schema = "oms_schema",
        indexes = @Index(name = "idx_oms_order_history_order_id", columnList = "order_id,at")
)
@Getter
@Setter
@NoArgsConstructor
public class OrderStatusHistoryJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_oms_order_history_order"))
    private OrderJpaEntity order;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private OrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private OrderStatus toStatus;

    @Column(name = "event", nullable = false, length = 60)
    private String event;

    @Column(name = "actor_user_id", nullable = false, length = 60)
    private String actorUserId;

    @Column(name = "at", nullable = false)
    private LocalDateTime at;
}
