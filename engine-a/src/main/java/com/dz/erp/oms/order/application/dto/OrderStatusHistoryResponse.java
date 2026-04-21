package com.dz.erp.oms.order.application.dto;

import com.dz.erp.oms.order.domain.model.OrderStatus;

import java.time.LocalDateTime;

public record OrderStatusHistoryResponse(
        OrderStatus fromStatus,
        OrderStatus toStatus,
        String event,
        String actorUserId,
        LocalDateTime at
) {}
