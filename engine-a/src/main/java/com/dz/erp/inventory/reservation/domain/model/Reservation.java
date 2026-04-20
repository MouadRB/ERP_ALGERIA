package com.dz.erp.inventory.reservation.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Getter
public class Reservation {
    private final String reservationId;
    private final String tenantId;
    private final String stockRecordId;
    private final String skuCode;
    private final String orderId;
    private String clientRef;
    private ReservationType reservationType;
    private final int quantity;
    private ReservationStatus status;
    private String omsStatus;
    private Instant expiresAt;
    private Instant upgradedAt;
    private Instant releasedAt;
    private final String createdBy;
    private final Instant createdAt;
    private long version;

    public static Reservation createSoft(String tenantId, String stockRecordId, String skuCode,
                                          String orderId, String clientRef, int quantity,
                                          Instant expiresAt, String omsStatus, String createdBy) {
        return new Reservation(UUID.randomUUID().toString(), tenantId, stockRecordId, skuCode,
                orderId, clientRef, ReservationType.SOFT, quantity,
                ReservationStatus.ACTIVE, omsStatus, expiresAt,
                null, null, createdBy, Instant.now(), 0);
    }

    public static Reservation reconstitute(
            String reservationId, String tenantId, String stockRecordId, String skuCode,
            String orderId, String clientRef, ReservationType reservationType, int quantity,
            ReservationStatus status, String omsStatus, Instant expiresAt,
            Instant upgradedAt, Instant releasedAt, String createdBy, Instant createdAt, long version) {
        return new Reservation(reservationId, tenantId, stockRecordId, skuCode,
                orderId, clientRef, reservationType, quantity,
                status, omsStatus, expiresAt, upgradedAt, releasedAt, createdBy, createdAt, version);
    }

    private Reservation(String reservationId, String tenantId, String stockRecordId, String skuCode,
                         String orderId, String clientRef, ReservationType reservationType, int quantity,
                         ReservationStatus status, String omsStatus, Instant expiresAt,
                         Instant upgradedAt, Instant releasedAt, String createdBy, Instant createdAt, long version) {
        this.reservationId = reservationId;
        this.tenantId = tenantId;
        this.stockRecordId = stockRecordId;
        this.skuCode = skuCode;
        this.orderId = orderId;
        this.clientRef = clientRef;
        this.reservationType = reservationType;
        this.quantity = quantity;
        this.status = status;
        this.omsStatus = omsStatus;
        this.expiresAt = expiresAt;
        this.upgradedAt = upgradedAt;
        this.releasedAt = releasedAt;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.version = version;
    }

    public void upgradeToHard() {
        if (this.reservationType != ReservationType.SOFT || this.status != ReservationStatus.ACTIVE)
            throw new BusinessException(ErrorCode.RESERVATION_INVALID_UPGRADE);
        this.reservationType = ReservationType.HARD;
        this.status = ReservationStatus.UPGRADED;
        this.upgradedAt = Instant.now();
        this.expiresAt = null;
    }

    public void release() {
        this.status = ReservationStatus.RELEASED;
        this.releasedAt = Instant.now();
    }

    public void expire() {
        this.status = ReservationStatus.EXPIRED;
        this.releasedAt = Instant.now();
    }

    public void markShipped() {
        this.status = ReservationStatus.SHIPPED;
        this.releasedAt = Instant.now();
    }

    public void updateOmsStatus(String omsStatus) {
        this.omsStatus = omsStatus;
    }

    public boolean isExpired() {
        return status == ReservationStatus.ACTIVE
                && reservationType == ReservationType.SOFT
                && expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
