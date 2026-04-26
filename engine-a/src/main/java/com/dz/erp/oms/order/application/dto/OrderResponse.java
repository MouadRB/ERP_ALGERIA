package com.dz.erp.oms.order.application.dto;

import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.domain.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Outbound view of an Order. Excludes event history — call the detail endpoint for that.
 */
public record OrderResponse(
        UUID orderId,
        String channelCode,
        String externalOrderRef,
        String idempotencyKey,
        String customerId,
        OrderStatus status,
        PaymentMethod paymentMethod,
        String currency,
        BigDecimal subtotalHt,
        BigDecimal taxTotal,
        BigDecimal shippingFee,
        BigDecimal grandTotalTtc,
        AddressCommand shippingAddress,
        AddressCommand billingAddress,
        List<OrderLineResponse> lines,
        List<OrderStatusHistoryResponse> statusHistory,
        LocalDateTime placedAt,
        LocalDateTime validatedAt,
        LocalDateTime confirmedAt,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt,
        LocalDateTime closedAt,
        LocalDateTime updatedAt,
        String rejectionReasonCode,
        String rejectionReasonMessage
) {}
