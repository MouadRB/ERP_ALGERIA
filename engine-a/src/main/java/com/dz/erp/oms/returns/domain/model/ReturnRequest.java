package com.dz.erp.oms.returns.domain.model;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.returns.domain.event.ReturnDomainEvent;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate root — a customer return against a previously paid Order.
 * Flow: REQUESTED → PICKUP_ARRANGED → IN_INSPECTION → CLOSED_APPROVED | CLOSED_REJECTED.
 */
public class ReturnRequest {

    private final UUID returnId;
    private final String tenantId;
    private final UUID orderId;
    private final String reasonCode;
    private final String reasonMessage;
    private final String requestedBy;
    private final List<ReturnLine> lines;

    private ReturnStatus status;
    private String carrierCode;
    private String inspectionId;
    private long version;

    private final LocalDateTime createdAt;
    private LocalDateTime pickupArrangedAt;
    private LocalDateTime closedAt;
    private LocalDateTime updatedAt;

    private final List<ReturnDomainEvent> pendingEvents = new ArrayList<>();

    public static ReturnRequest create(String tenantId, UUID orderId, List<ReturnLine> lines,
                                       String reasonCode, String reasonMessage,
                                       String requestedBy, LocalDateTime now) {
        if (lines == null || lines.isEmpty()) throw new IllegalArgumentException("at least one line");
        var r = new ReturnRequest(UUID.randomUUID(), tenantId, orderId, reasonCode, reasonMessage,
                requestedBy, new ArrayList<>(lines), ReturnStatus.REQUESTED,
                null, null, 0L, now, null, null, now);
        r.pendingEvents.add(new ReturnDomainEvent.ReturnRequested(
                UUID.randomUUID().toString(), OmsEventTypes.RETURN_REQUESTED, 1,
                tenantId, OmsEventTypes.AGGREGATE_RETURN, r.returnId.toString(), toInstant(now),
                orderId.toString(), lines.size(), reasonCode));
        return r;
    }

    private static Instant toInstant(LocalDateTime ts) {
        return ts.toInstant(ZoneOffset.UTC);
    }

    public static ReturnRequest reconstitute(UUID returnId, String tenantId, UUID orderId,
                                             String reasonCode, String reasonMessage,
                                             String requestedBy, List<ReturnLine> lines,
                                             ReturnStatus status, String carrierCode,
                                             String inspectionId, long version,
                                             LocalDateTime createdAt, LocalDateTime pickupArrangedAt,
                                             LocalDateTime closedAt, LocalDateTime updatedAt) {
        return new ReturnRequest(returnId, tenantId, orderId, reasonCode, reasonMessage,
                requestedBy, new ArrayList<>(lines), status, carrierCode, inspectionId,
                version, createdAt, pickupArrangedAt, closedAt, updatedAt);
    }

    private ReturnRequest(UUID returnId, String tenantId, UUID orderId, String reasonCode,
                          String reasonMessage, String requestedBy, List<ReturnLine> lines,
                          ReturnStatus status, String carrierCode, String inspectionId, long version,
                          LocalDateTime createdAt, LocalDateTime pickupArrangedAt,
                          LocalDateTime closedAt, LocalDateTime updatedAt) {
        this.returnId = returnId;
        this.tenantId = tenantId;
        this.orderId = orderId;
        this.reasonCode = reasonCode;
        this.reasonMessage = reasonMessage;
        this.requestedBy = requestedBy;
        this.lines = lines;
        this.status = status;
        this.carrierCode = carrierCode;
        this.inspectionId = inspectionId;
        this.version = version;
        this.createdAt = createdAt;
        this.pickupArrangedAt = pickupArrangedAt;
        this.closedAt = closedAt;
        this.updatedAt = updatedAt;
    }

    public void arrangePickup(String carrierCode, String inspectionId, LocalDateTime now) {
        if (status != ReturnStatus.REQUESTED) {
            throw new IllegalStateException("Cannot arrange pickup from " + status);
        }
        this.status = ReturnStatus.IN_INSPECTION;
        this.carrierCode = carrierCode;
        this.inspectionId = inspectionId;
        this.pickupArrangedAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ReturnDomainEvent.ReturnPickupArranged(
                UUID.randomUUID().toString(), "OMS_RETURN_PICKUP_ARRANGED", 1,
                tenantId, OmsEventTypes.AGGREGATE_RETURN, returnId.toString(), toInstant(now),
                orderId.toString(), carrierCode));
    }

    public void closeApproved(LocalDateTime now) {
        if (status != ReturnStatus.IN_INSPECTION) {
            throw new IllegalStateException("Cannot close return from " + status);
        }
        this.status = ReturnStatus.CLOSED_APPROVED;
        this.closedAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ReturnDomainEvent.ReturnClosed(
                UUID.randomUUID().toString(), OmsEventTypes.RETURN_CLOSED, 1,
                tenantId, OmsEventTypes.AGGREGATE_RETURN, returnId.toString(), toInstant(now),
                orderId.toString(), true));
    }

    public void closeRejected(LocalDateTime now) {
        if (status != ReturnStatus.IN_INSPECTION) {
            throw new IllegalStateException("Cannot close return from " + status);
        }
        this.status = ReturnStatus.CLOSED_REJECTED;
        this.closedAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ReturnDomainEvent.ReturnClosed(
                UUID.randomUUID().toString(), OmsEventTypes.RETURN_CLOSED, 1,
                tenantId, OmsEventTypes.AGGREGATE_RETURN, returnId.toString(), toInstant(now),
                orderId.toString(), false));
    }

    public List<ReturnDomainEvent> drainEvents() {
        var drained = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return drained;
    }

    public BigTotal totalRefundAmount() {
        var total = java.math.BigDecimal.ZERO;
        for (var l : lines) {
            if (l.getRefundAmount() != null) total = total.add(l.getRefundAmount());
        }
        return new BigTotal(total);
    }

    public record BigTotal(java.math.BigDecimal value) {}

    // ── Getters ──

    public UUID getReturnId() { return returnId; }
    public String getTenantId() { return tenantId; }
    public UUID getOrderId() { return orderId; }
    public String getReasonCode() { return reasonCode; }
    public String getReasonMessage() { return reasonMessage; }
    public String getRequestedBy() { return requestedBy; }
    public List<ReturnLine> getLines() { return Collections.unmodifiableList(lines); }
    public ReturnStatus getStatus() { return status; }
    public String getCarrierCode() { return carrierCode; }
    public String getInspectionId() { return inspectionId; }
    public long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getPickupArrangedAt() { return pickupArrangedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
