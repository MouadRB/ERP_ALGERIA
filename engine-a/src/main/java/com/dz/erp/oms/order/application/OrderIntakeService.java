package com.dz.erp.oms.order.application;

import com.dz.erp.oms.order.application.dto.AddressCommand;
import com.dz.erp.oms.order.application.dto.OrderLineCommand;
import com.dz.erp.oms.order.application.dto.OrderResponse;
import com.dz.erp.oms.order.application.dto.PlaceOrderCommand;
import com.dz.erp.oms.order.application.mapper.OrderDtoMapper;
import com.dz.erp.oms.order.domain.model.Address;
import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.model.OrderLine;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Stage 1 order-intake orchestration.
 *
 * <p>Responsibilities: (1) idempotent replay — same
 * {@code (tenantId, channelCode, idempotencyKey)} returns the existing order;
 * (2) build the domain aggregate from the command, (3) persist + drain events in
 * one transaction, (4) invoke {@link OrderValidationService} to transition the
 * order to {@code VALIDATED} or {@code REJECTED} synchronously.
 *
 * <p>Validation runs in its own transaction ({@code @Transactional} on that service)
 * so the {@code RECEIVED} row is always visible even if validation itself fails hard
 * — matches the "persist first, validate second" guarantee from design §3.3.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderIntakeService {

    private final OrderRepositoryPort orderRepo;
    private final OrderEventPort orderEvents;
    private final OrderValidationService validationService;
    private final OrderDtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId) {
        var tenantId = AuthContext.currentTenantId();
        var order = orderRepo.findById(tenantId, orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.OMS_ORDER_NOT_FOUND, orderId));
        return dtoMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listRecent(int page, int size) {
        var tenantId = AuthContext.currentTenantId();
        return orderRepo.findRecent(tenantId, page, size).stream()
                .map(dtoMapper::toResponse)
                .toList();
    }

    /**
     * Place an order. If an order already exists for
     * {@code (tenantId, channelCode, idempotencyKey)}, the existing aggregate is
     * returned unchanged — no new events are emitted and no exception is thrown
     * (per design §3.3 this is a valid replay, not an error).
     *
     * <p>Persistence, outbox write, and validation all run in a single transaction.
     * {@link OrderValidationService#validate(Order)} drains its own events and
     * participates via {@code REQUIRES_NEW} propagation... actually no, REQUIRED
     * — the whole flow commits atomically or rolls back together.
     */
    @Transactional
    public OrderResponse place(PlaceOrderCommand cmd, String idempotencyKey) {
        var tenantId = AuthContext.currentTenantId();

        var existing = orderRepo.findByIdempotencyKey(tenantId, cmd.channelCode(), idempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent replay: returning existing order {} for key {}/{}",
                    existing.get().getOrderId(), cmd.channelCode(), idempotencyKey);
            return dtoMapper.toResponse(existing.get());
        }

        var actor = AuthContext.currentUserId();
        var now = LocalDateTime.now();

        var lines = cmd.lines().stream().map(OrderIntakeService::toLine).toList();
        var order = Order.place(
                tenantId,
                cmd.channelCode(),
                cmd.externalOrderRef(),
                idempotencyKey,
                cmd.customerId(),
                cmd.paymentMethod(),
                cmd.currency(),
                cmd.subtotalHt(),
                cmd.taxTotal(),
                cmd.shippingFee(),
                cmd.grandTotalTtc(),
                toAddress(cmd.shippingAddress()),
                toAddress(cmd.billingAddress()),
                lines,
                actor,
                now
        );

        var receivedEvents = order.drainEvents();
        var received = orderRepo.save(order);
        receivedEvents.forEach(e -> orderEvents.publish(e.eventType(), e.aggregateId(), e));
        log.info("Order {} persisted as RECEIVED for tenant={}, channel={}",
                received.getOrderId(), tenantId, cmd.channelCode());

        var validated = validationService.validate(received);
        return dtoMapper.toResponse(validated);
    }

    // ──────────────────────────────────────────────
    // Mapping helpers
    // ──────────────────────────────────────────────

    private static OrderLine toLine(OrderLineCommand c) {
        return OrderLine.create(
                c.skuCode(), c.variantId(),
                c.productNameFr(), c.productNameAr(),
                c.unitPriceHt(), c.unitPriceTtc(), c.taxRuleCode(),
                c.quantity()
        );
    }

    private static Address toAddress(AddressCommand a) {
        if (a == null) return null;
        return new Address(
                a.recipientName(), a.phone(), a.wilayaCode(), a.commune(),
                a.line1(), a.line2(), a.postalCode(), a.notes());
    }
}
