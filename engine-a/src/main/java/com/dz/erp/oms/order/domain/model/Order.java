package com.dz.erp.oms.order.domain.model;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.order.domain.event.OrderDomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Order aggregate root. Pure-Java domain — no Spring / JPA / Lombok.
 *
 * <p>Enforces the OMS finite-state machine (see {@code docs/OMS_MODULE.md} §3).
 * Every transition emits one or more {@link OrderDomainEvent}s onto
 * {@link #pendingEvents}; the application service drains them inside the same
 * transaction as the repository save, and hands them to the outbox adapter.
 *
 * <p>Totals (subtotalHt / taxTotal / shippingFee / grandTotalTtc) are <b>authoritative
 * from the channel submission</b>. OMS does not recompute prices — it snapshots what
 * the channel said (see design §4.1 "Snapshots").
 *
 * <p>Construction is via the static factories {@link #place} (new intake) and
 * {@link #reconstitute} (rehydrate from persistence). Status is only mutated through
 * the domain methods below.
 */
public class Order {

    // ── Identity ──
    private final UUID orderId;
    private final String tenantId;
    private final String channelCode;
    private final String externalOrderRef;
    private final String idempotencyKey;
    private final String customerId;

    // ── State ──
    private OrderStatus status;
    private final PaymentMethod paymentMethod;

    // ── Totals (snapshot from channel submission) ──
    private final String currency;
    private final BigDecimal subtotalHt;
    private final BigDecimal taxTotal;
    private final BigDecimal shippingFee;
    private final BigDecimal grandTotalTtc;

    // ── Snapshots ──
    private final Address shippingAddress;
    private final Address billingAddress;

    // ── Lines & history ──
    private final List<OrderLine> lines;
    private final List<OrderStatusHistory> statusHistory;

    // ── Timestamps ──
    private final LocalDateTime placedAt;
    private LocalDateTime validatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime closedAt;
    private LocalDateTime updatedAt;
    private long version;

    // ── Rejection details (populated only on REJECTED) ──
    private String rejectionReasonCode;
    private String rejectionReasonMessage;

    // ── Transient — drained by application service after save ──
    private final List<OrderDomainEvent> pendingEvents = new ArrayList<>();

    // ──────────────────────────────────────────────
    // Factories
    // ──────────────────────────────────────────────

    /**
     * Intake factory — called by {@code OrderIntakeService.place(...)}.
     *
     * <p>Produces a fresh order in {@link OrderStatus#RECEIVED} and emits an
     * {@link OrderDomainEvent.OrderReceived}. The validator service must run next
     * to move it to {@code VALIDATED} or {@code REJECTED}.
     */
    public static Order place(String tenantId,
                              String channelCode,
                              String externalOrderRef,
                              String idempotencyKey,
                              String customerId,
                              PaymentMethod paymentMethod,
                              String currency,
                              BigDecimal subtotalHt,
                              BigDecimal taxTotal,
                              BigDecimal shippingFee,
                              BigDecimal grandTotalTtc,
                              Address shippingAddress,
                              Address billingAddress,
                              List<OrderLine> lines,
                              String actorUserId,
                              LocalDateTime now) {
        if (tenantId == null || tenantId.isBlank()) throw new IllegalArgumentException("tenantId is required");
        if (channelCode == null || channelCode.isBlank()) throw new IllegalArgumentException("channelCode is required");
        if (idempotencyKey == null || idempotencyKey.isBlank()) throw new IllegalArgumentException("idempotencyKey is required");
        if (customerId == null || customerId.isBlank()) throw new IllegalArgumentException("customerId is required");
        if (lines == null || lines.isEmpty()) throw new IllegalArgumentException("at least one order line is required");
        if (shippingAddress == null) throw new IllegalArgumentException("shippingAddress is required");

        UUID orderId = UUID.randomUUID();
        Address billing = (billingAddress != null) ? billingAddress : shippingAddress;

        var order = new Order(
                orderId, tenantId, channelCode, externalOrderRef, idempotencyKey, customerId,
                OrderStatus.RECEIVED, paymentMethod,
                currency, subtotalHt, taxTotal, shippingFee, grandTotalTtc,
                shippingAddress, billing,
                new ArrayList<>(lines), new ArrayList<>(),
                now, null, null, null, null, null, now, 0L,
                null, null
        );

        order.statusHistory.add(OrderStatusHistory.record(
                orderId, null, OrderStatus.RECEIVED,
                OmsEventTypes.ORDER_RECEIVED, actorUserId, now));

        order.pendingEvents.add(new OrderDomainEvent.OrderReceived(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_RECEIVED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                channelCode, externalOrderRef, customerId, paymentMethod, currency, grandTotalTtc,
                shippingAddress.phone(), shippingAddress.recipientName(), parseWilaya(shippingAddress.wilayaCode())));

        return order;
    }

    private static Instant toInstant(LocalDateTime ts) {
        return ts.toInstant(ZoneOffset.UTC);
    }

    private static Integer parseWilaya(String code) {
        if (code == null || code.isBlank()) return null;
        try { return Integer.valueOf(code.trim()); }
        catch (NumberFormatException e) { return null; }
    }

    /**
     * Rehydrate from persistence. No events fired, no validation — this is a read.
     */
    public static Order reconstitute(UUID orderId, String tenantId, String channelCode,
                                     String externalOrderRef, String idempotencyKey, String customerId,
                                     OrderStatus status, PaymentMethod paymentMethod,
                                     String currency, BigDecimal subtotalHt, BigDecimal taxTotal,
                                     BigDecimal shippingFee, BigDecimal grandTotalTtc,
                                     Address shippingAddress, Address billingAddress,
                                     List<OrderLine> lines, List<OrderStatusHistory> statusHistory,
                                     LocalDateTime placedAt, LocalDateTime validatedAt,
                                     LocalDateTime confirmedAt, LocalDateTime shippedAt,
                                     LocalDateTime deliveredAt, LocalDateTime closedAt,
                                     LocalDateTime updatedAt, long version,
                                     String rejectionReasonCode, String rejectionReasonMessage) {
        return new Order(orderId, tenantId, channelCode, externalOrderRef, idempotencyKey, customerId,
                status, paymentMethod, currency, subtotalHt, taxTotal, shippingFee, grandTotalTtc,
                shippingAddress, billingAddress,
                new ArrayList<>(lines),
                new ArrayList<>(statusHistory),
                placedAt, validatedAt, confirmedAt, shippedAt, deliveredAt, closedAt,
                updatedAt, version, rejectionReasonCode, rejectionReasonMessage);
    }

    private Order(UUID orderId, String tenantId, String channelCode, String externalOrderRef,
                  String idempotencyKey, String customerId,
                  OrderStatus status, PaymentMethod paymentMethod,
                  String currency, BigDecimal subtotalHt, BigDecimal taxTotal,
                  BigDecimal shippingFee, BigDecimal grandTotalTtc,
                  Address shippingAddress, Address billingAddress,
                  List<OrderLine> lines, List<OrderStatusHistory> statusHistory,
                  LocalDateTime placedAt, LocalDateTime validatedAt,
                  LocalDateTime confirmedAt, LocalDateTime shippedAt,
                  LocalDateTime deliveredAt, LocalDateTime closedAt,
                  LocalDateTime updatedAt, long version,
                  String rejectionReasonCode, String rejectionReasonMessage) {
        this.orderId = orderId;
        this.tenantId = tenantId;
        this.channelCode = channelCode;
        this.externalOrderRef = externalOrderRef;
        this.idempotencyKey = idempotencyKey;
        this.customerId = customerId;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.currency = currency;
        this.subtotalHt = subtotalHt;
        this.taxTotal = taxTotal;
        this.shippingFee = shippingFee;
        this.grandTotalTtc = grandTotalTtc;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.lines = lines;
        this.statusHistory = statusHistory;
        this.placedAt = placedAt;
        this.validatedAt = validatedAt;
        this.confirmedAt = confirmedAt;
        this.shippedAt = shippedAt;
        this.deliveredAt = deliveredAt;
        this.closedAt = closedAt;
        this.updatedAt = updatedAt;
        this.version = version;
        this.rejectionReasonCode = rejectionReasonCode;
        this.rejectionReasonMessage = rejectionReasonMessage;
    }

    // ──────────────────────────────────────────────
    // Transitions (Stage 1 subset: validate / reject)
    // ──────────────────────────────────────────────

    /**
     * RECEIVED → VALIDATED. Called by {@code OrderValidationService} once channel,
     * products, customer, and address have all passed their port checks.
     */
    public void markValidated(String actorUserId, LocalDateTime now) {
        requireStatus(OrderStatus.RECEIVED, "validate");
        transition(OrderStatus.VALIDATED, OmsEventTypes.ORDER_VALIDATED, actorUserId, now);
        this.validatedAt = now;
        this.pendingEvents.add(new OrderDomainEvent.OrderValidated(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_VALIDATED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                channelCode));
    }

    /**
     * RECEIVED → REJECTED (terminal). No reservation has been taken, so there is
     * nothing to compensate.
     */
    public void markRejected(String reasonCode, String reasonMessage,
                             String actorUserId, LocalDateTime now) {
        requireStatus(OrderStatus.RECEIVED, "reject");
        this.rejectionReasonCode = reasonCode;
        this.rejectionReasonMessage = reasonMessage;
        transition(OrderStatus.REJECTED, OmsEventTypes.ORDER_REJECTED, actorUserId, now);
        this.closedAt = now;
        this.pendingEvents.add(new OrderDomainEvent.OrderRejected(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_REJECTED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                reasonCode, reasonMessage,
                shippingAddress.phone(), shippingAddress.recipientName(), parseWilaya(shippingAddress.wilayaCode()),
                externalOrderRef));
    }

    // ──────────────────────────────────────────────
    // Stage 2 transitions — reservation lifecycle
    // ──────────────────────────────────────────────

    /**
     * VALIDATED → RESERVED. Called by {@code OrderReservationService} once every line
     * has a SOFT reservation. Each line's {@code reservationId} must already be set
     * via {@link #attachLineReservation}.
     */
    public void markReserved(String actorUserId, LocalDateTime now) {
        requireStatus(OrderStatus.VALIDATED, "reserve");
        transition(OrderStatus.RESERVED, OmsEventTypes.ORDER_RESERVED, actorUserId, now);
        this.pendingEvents.add(new OrderDomainEvent.OrderReserved(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_RESERVED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now)));
    }

    /**
     * VALIDATED → AWAITING_STOCK. Called when at least one line cannot be reserved.
     * Any partial reservations must have been released by the service before this call.
     * Order stays alive; a re-order retry is possible when stock is replenished.
     */
    public void markAwaitingStock(String reasonCode, String reasonMessage,
                                  String actorUserId, LocalDateTime now) {
        requireStatus(OrderStatus.VALIDATED, "mark awaiting stock");
        this.rejectionReasonCode = reasonCode;
        this.rejectionReasonMessage = reasonMessage;
        transition(OrderStatus.AWAITING_STOCK, OmsEventTypes.ORDER_AWAITING_STOCK, actorUserId, now);
        this.pendingEvents.add(new OrderDomainEvent.OrderAwaitingStock(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_AWAITING_STOCK, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                reasonCode, reasonMessage));
    }

    /**
     * RESERVED → CONFIRMED. Called by {@code OrderLifecycleService.confirm} after every
     * reservation has been upgraded SOFT → HARD.
     */
    public void markConfirmed(String actorUserId, LocalDateTime now) {
        requireStatus(OrderStatus.RESERVED, "confirm");
        transition(OrderStatus.CONFIRMED, OmsEventTypes.ORDER_CONFIRMED, actorUserId, now);
        this.confirmedAt = now;
        this.pendingEvents.add(new OrderDomainEvent.OrderConfirmed(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_CONFIRMED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                shippingAddress.phone(), shippingAddress.recipientName(), parseWilaya(shippingAddress.wilayaCode()),
                externalOrderRef));
    }

    /**
     * Cancels the order from a non-terminal state. Used by the reservation-expired
     * listener (auto-cancel on SOFT expiry) and by operator cancellations.
     * Reservations must be released by the caller before this call.
     */
    public void markCancelled(String reasonCode, String reasonMessage,
                              String actorUserId, LocalDateTime now) {
        if (this.status == OrderStatus.CANCELLED || this.status == OrderStatus.COMPLETED
                || this.status == OrderStatus.REJECTED) {
            throw new IllegalStateException(
                    "Cannot cancel order in terminal status " + this.status);
        }
        this.rejectionReasonCode = reasonCode;
        this.rejectionReasonMessage = reasonMessage;
        transition(OrderStatus.CANCELLED, OmsEventTypes.ORDER_CANCELLED, actorUserId, now);
        this.closedAt = now;
        this.pendingEvents.add(new OrderDomainEvent.OrderCancelled(
                UUID.randomUUID().toString(), OmsEventTypes.ORDER_CANCELLED, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                reasonCode, reasonMessage,
                shippingAddress.phone(), shippingAddress.recipientName(), parseWilaya(shippingAddress.wilayaCode()),
                externalOrderRef));
    }

    // ──────────────────────────────────────────────
    // Stage 3 / 4 transitions — fulfillment and shipment
    // ──────────────────────────────────────────────

    /** CONFIRMED → PACKED. Called when the warehouse finishes packing. */
    public void markPacked(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.CONFIRMED && this.status != OrderStatus.PACKED) {
            throw new IllegalStateException("Cannot mark packed in status " + this.status);
        }
        if (this.status == OrderStatus.PACKED) return;
        transition(OrderStatus.PACKED, OmsEventTypes.ORDER_PACKED, actorUserId, now);
    }

    /** PACKED → SHIPMENT_REQUESTED. Submitted to a carrier. */
    public void markShipmentRequested(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.PACKED) {
            throw new IllegalStateException("Cannot request shipment from status " + this.status);
        }
        transition(OrderStatus.SHIPMENT_REQUESTED, OmsEventTypes.SHIPMENT_SUBMITTED, actorUserId, now);
    }

    /** → HANDED_TO_CARRIER. Carrier webhook: pickup confirmed. */
    public void markHandedToCarrier(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.SHIPMENT_REQUESTED && this.status != OrderStatus.HANDED_TO_CARRIER) {
            throw new IllegalStateException("Cannot mark handed-to-carrier from " + this.status);
        }
        if (this.status == OrderStatus.HANDED_TO_CARRIER) return;
        transition(OrderStatus.HANDED_TO_CARRIER, OmsEventTypes.SHIPMENT_PICKED_UP, actorUserId, now);
    }

    /** → IN_TRANSIT. */
    public void markInTransit(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.HANDED_TO_CARRIER && this.status != OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Cannot mark in-transit from " + this.status);
        }
        if (this.status == OrderStatus.IN_TRANSIT) return;
        transition(OrderStatus.IN_TRANSIT, OmsEventTypes.SHIPMENT_PICKED_UP, actorUserId, now);
        this.shippedAt = now;
    }

    /** → DELIVERED. Terminal (pending payment/closure). */
    public void markDelivered(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.IN_TRANSIT && this.status != OrderStatus.HANDED_TO_CARRIER) {
            throw new IllegalStateException("Cannot mark delivered from " + this.status);
        }
        transition(OrderStatus.DELIVERED, OmsEventTypes.SHIPMENT_DELIVERED, actorUserId, now);
        this.deliveredAt = now;
    }

    /** DELIVERED/RETURN_REQUESTED → COMPLETED. Terminal success state. */
    public void markCompleted(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.DELIVERED
                && this.status != OrderStatus.RETURN_REQUESTED
                && this.status != OrderStatus.RETURN_IN_INSPECTION
                && this.status != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot complete from " + this.status);
        }
        if (this.status == OrderStatus.COMPLETED) return;
        transition(OrderStatus.COMPLETED, OmsEventTypes.ORDER_COMPLETED, actorUserId, now);
    }

    /** DELIVERED → RETURN_REQUESTED. Customer service opens a return. */
    public void markReturnRequested(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.DELIVERED && this.status != OrderStatus.RETURN_REQUESTED) {
            throw new IllegalStateException("Cannot request return from " + this.status);
        }
        if (this.status == OrderStatus.RETURN_REQUESTED) return;
        transition(OrderStatus.RETURN_REQUESTED, OmsEventTypes.RETURN_REQUESTED, actorUserId, now);
    }

    /** RETURN_REQUESTED → RETURN_IN_INSPECTION. */
    public void markReturnInInspection(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.RETURN_REQUESTED
                && this.status != OrderStatus.RETURN_IN_INSPECTION) {
            throw new IllegalStateException("Cannot inspect return from " + this.status);
        }
        if (this.status == OrderStatus.RETURN_IN_INSPECTION) return;
        transition(OrderStatus.RETURN_IN_INSPECTION, OmsEventTypes.RETURN_REQUESTED, actorUserId, now);
    }

    /** RETURN_IN_INSPECTION → RETURNED. Terminal. */
    public void markReturned(String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.RETURN_IN_INSPECTION && this.status != OrderStatus.RETURNED) {
            throw new IllegalStateException("Cannot close return from " + this.status);
        }
        if (this.status == OrderStatus.RETURNED) return;
        transition(OrderStatus.RETURNED, OmsEventTypes.RETURN_CLOSED, actorUserId, now);
    }

    /** → DELIVERY_FAILED. Carrier webhook: attempted delivery failed. */
    public void markDeliveryFailed(String reasonCode, String reasonMessage,
                                   String actorUserId, LocalDateTime now) {
        if (this.status != OrderStatus.IN_TRANSIT && this.status != OrderStatus.HANDED_TO_CARRIER) {
            throw new IllegalStateException("Cannot mark delivery-failed from " + this.status);
        }
        this.rejectionReasonCode = reasonCode;
        this.rejectionReasonMessage = reasonMessage;
        transition(OrderStatus.DELIVERY_FAILED, OmsEventTypes.SHIPMENT_FAILED, actorUserId, now);
    }

    /**
     * Attach a reservation id to the line matching {@code skuCode}. Called by the
     * reservation service after each successful SOFT reserve. No-op if the line is
     * not found (defensive — service should only pass SKUs that exist).
     */
    public void attachLineReservation(String skuCode, UUID reservationId) {
        for (OrderLine line : this.lines) {
            if (line.getSkuCode().equals(skuCode) && line.getReservationId() == null) {
                line.attachReservation(reservationId);
                return;
            }
        }
    }

    // ──────────────────────────────────────────────
    // Transition helpers
    // ──────────────────────────────────────────────

    private void requireStatus(OrderStatus expected, String action) {
        if (this.status != expected) {
            throw new IllegalStateException(
                    "Cannot " + action + " order in status " + this.status + "; expected " + expected);
        }
    }

    private void transition(OrderStatus to, String eventType, String actorUserId, LocalDateTime now) {
        var previous = this.status;
        this.status = to;
        this.updatedAt = now;
        this.statusHistory.add(OrderStatusHistory.record(
                orderId, previous, to, eventType, actorUserId, now));
        this.pendingEvents.add(new OrderDomainEvent.OrderStatusChanged(
                UUID.randomUUID().toString(), eventType, 1,
                tenantId, OmsEventTypes.AGGREGATE_ORDER, orderId.toString(), toInstant(now),
                previous, to, eventType,
                shippingAddress.phone(), shippingAddress.recipientName(), parseWilaya(shippingAddress.wilayaCode()),
                externalOrderRef, grandTotalTtc));
    }

    // ──────────────────────────────────────────────
    // Event drain (called by the application service)
    // ──────────────────────────────────────────────

    public List<OrderDomainEvent> drainEvents() {
        var drained = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return drained;
    }

    // ──────────────────────────────────────────────
    // Getters (read-only; no setters)
    // ──────────────────────────────────────────────

    public UUID getOrderId() { return orderId; }
    public String getTenantId() { return tenantId; }
    public String getChannelCode() { return channelCode; }
    public String getExternalOrderRef() { return externalOrderRef; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getCustomerId() { return customerId; }
    public OrderStatus getStatus() { return status; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getCurrency() { return currency; }
    public BigDecimal getSubtotalHt() { return subtotalHt; }
    public BigDecimal getTaxTotal() { return taxTotal; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public BigDecimal getGrandTotalTtc() { return grandTotalTtc; }
    public Address getShippingAddress() { return shippingAddress; }
    public Address getBillingAddress() { return billingAddress; }
    public List<OrderLine> getLines() { return Collections.unmodifiableList(lines); }
    public List<OrderStatusHistory> getStatusHistory() { return Collections.unmodifiableList(statusHistory); }
    public LocalDateTime getPlacedAt() { return placedAt; }
    public LocalDateTime getValidatedAt() { return validatedAt; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public LocalDateTime getShippedAt() { return shippedAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public long getVersion() { return version; }
    public String getRejectionReasonCode() { return rejectionReasonCode; }
    public String getRejectionReasonMessage() { return rejectionReasonMessage; }
}
