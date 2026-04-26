package com.dz.erp.oms.returns.application.dto;

import com.dz.erp.oms.returns.domain.model.ReturnStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReturnRequestResponse(
        UUID returnId,
        UUID orderId,
        ReturnStatus status,
        String reasonCode,
        String reasonMessage,
        String carrierCode,
        String inspectionId,
        LocalDateTime createdAt,
        LocalDateTime pickupArrangedAt,
        LocalDateTime closedAt,
        List<Line> lines
) {
    public record Line(
            UUID lineId, String skuCode, UUID variantId,
            int quantity, BigDecimal refundAmount, String reasonCode) {}
}
