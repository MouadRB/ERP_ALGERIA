package com.dz.erp.inventory.reservation.infrastructure.persistence;

import com.dz.erp.inventory.reservation.domain.model.ReservationStatus;
import com.dz.erp.inventory.reservation.domain.model.ReservationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "reservations", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class ReservationJpaEntity {
    @Id
    @Column(length = 36)
    private String reservationId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Column(nullable = false, length = 50)
    private String orderId;
    @Column(length = 100)
    private String clientRef;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ReservationType reservationType;
    @Column(nullable = false)
    private int quantity;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status;
    @Column(length = 30)
    private String omsStatus;
    private Instant expiresAt;
    private Instant upgradedAt;
    private Instant releasedAt;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Version
    private long version;
}
