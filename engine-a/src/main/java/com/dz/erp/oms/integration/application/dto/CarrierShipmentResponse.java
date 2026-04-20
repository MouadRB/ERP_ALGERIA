package com.dz.erp.oms.integration.application.dto;

import com.dz.erp.oms.integration.domain.model.ShipmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record CarrierShipmentResponse(
        UUID shipmentId,
        UUID orderId,
        String carrierCode,
        ShipmentStatus status,
        String trackingNumber,
        String labelUrl,
        String failureReasonCode,
        String failureReasonMessage,
        LocalDateTime createdAt,
        LocalDateTime submittedAt,
        LocalDateTime pickedUpAt,
        LocalDateTime deliveredAt,
        LocalDateTime updatedAt
) {}
