package com.dz.erp.inventory.reservation.application.dto;

import java.time.Instant;

public record ReservationResponse(
    String reservationId, String skuCode, String orderId, String clientRef,
    String reservationType, int quantity, String status,
    String omsStatus, Instant expiresAt, Instant createdAt
) {}
