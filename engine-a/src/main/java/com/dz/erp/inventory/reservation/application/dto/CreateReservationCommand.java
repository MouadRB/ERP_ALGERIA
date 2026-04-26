package com.dz.erp.inventory.reservation.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateReservationCommand(
    @NotBlank String skuCode,
    @NotBlank String orderId,
    String clientRef,
    @Min(1) int quantity,
    String omsStatus
) {}
