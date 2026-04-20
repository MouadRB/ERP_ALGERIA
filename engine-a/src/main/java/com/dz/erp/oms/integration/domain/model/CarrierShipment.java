package com.dz.erp.oms.integration.domain.model;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.integration.domain.event.ShipmentDomainEvent;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate root — one {@code CarrierShipment} per order per carrier submission.
 *
 * <p>State machine: {@code CREATED → SUBMITTED → HANDED_TO_CARRIER → IN_TRANSIT →
 * DELIVERED | FAILED}. Transitions are driven either by the initial submission
 * (manual or external adapter) or by normalized carrier webhook events.
 */
public class CarrierShipment {

    private final UUID shipmentId;
    private final String tenantId;
    private final UUID orderId;
    private final String carrierCode;

    private ShipmentStatus status;
    private String trackingNumber;
    private String labelUrl;
    private String failureReasonCode;
    private String failureReasonMessage;
    private long version;

    private final LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime updatedAt;

    private final List<ShipmentDomainEvent> pendingEvents = new ArrayList<>();

    public static CarrierShipment create(String tenantId, UUID orderId, String carrierCode,
                                         LocalDateTime now) {
        return new CarrierShipment(UUID.randomUUID(), tenantId, orderId, carrierCode,
                ShipmentStatus.CREATED, null, null, null, null, 0L, now, null, null, null, now);
    }

    public static CarrierShipment reconstitute(UUID shipmentId, String tenantId, UUID orderId,
                                               String carrierCode, ShipmentStatus status,
                                               String trackingNumber, String labelUrl,
                                               String failureReasonCode, String failureReasonMessage,
                                               long version,
                                               LocalDateTime createdAt, LocalDateTime submittedAt,
                                               LocalDateTime pickedUpAt, LocalDateTime deliveredAt,
                                               LocalDateTime updatedAt) {
        return new CarrierShipment(shipmentId, tenantId, orderId, carrierCode, status,
                trackingNumber, labelUrl, failureReasonCode, failureReasonMessage, version,
                createdAt, submittedAt, pickedUpAt, deliveredAt, updatedAt);
    }

    private CarrierShipment(UUID shipmentId, String tenantId, UUID orderId, String carrierCode,
                            ShipmentStatus status, String trackingNumber, String labelUrl,
                            String failureReasonCode, String failureReasonMessage, long version,
                            LocalDateTime createdAt, LocalDateTime submittedAt,
                            LocalDateTime pickedUpAt, LocalDateTime deliveredAt,
                            LocalDateTime updatedAt) {
        this.shipmentId = shipmentId;
        this.tenantId = tenantId;
        this.orderId = orderId;
        this.carrierCode = carrierCode;
        this.status = status;
        this.trackingNumber = trackingNumber;
        this.labelUrl = labelUrl;
        this.failureReasonCode = failureReasonCode;
        this.failureReasonMessage = failureReasonMessage;
        this.version = version;
        this.createdAt = createdAt;
        this.submittedAt = submittedAt;
        this.pickedUpAt = pickedUpAt;
        this.deliveredAt = deliveredAt;
        this.updatedAt = updatedAt;
    }

    // ── Transitions ──

    public void markSubmitted(String trackingNumber, String labelUrl, LocalDateTime now) {
        if (status != ShipmentStatus.CREATED) {
            throw new IllegalStateException("Cannot submit shipment in status " + status);
        }
        this.status = ShipmentStatus.SUBMITTED;
        this.trackingNumber = trackingNumber;
        this.labelUrl = labelUrl;
        this.submittedAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ShipmentDomainEvent.ShipmentSubmitted(
                UUID.randomUUID().toString(), OmsEventTypes.SHIPMENT_SUBMITTED, 1,
                tenantId, OmsEventTypes.AGGREGATE_SHIPMENT, shipmentId.toString(), toInstant(now),
                orderId.toString(), carrierCode, trackingNumber));
    }

    private static Instant toInstant(LocalDateTime ts) {
        return ts.toInstant(ZoneOffset.UTC);
    }

    public void markPickedUp(LocalDateTime now) {
        if (status != ShipmentStatus.SUBMITTED && status != ShipmentStatus.HANDED_TO_CARRIER) {
            throw new IllegalStateException("Cannot mark picked up from " + status);
        }
        if (status == ShipmentStatus.HANDED_TO_CARRIER) return;
        this.status = ShipmentStatus.HANDED_TO_CARRIER;
        this.pickedUpAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ShipmentDomainEvent.ShipmentPickedUp(
                UUID.randomUUID().toString(), OmsEventTypes.SHIPMENT_PICKED_UP, 1,
                tenantId, OmsEventTypes.AGGREGATE_SHIPMENT, shipmentId.toString(), toInstant(now),
                orderId.toString(), carrierCode));
    }

    public void markInTransit(LocalDateTime now) {
        if (status == ShipmentStatus.IN_TRANSIT) return;
        if (status != ShipmentStatus.SUBMITTED && status != ShipmentStatus.HANDED_TO_CARRIER) {
            throw new IllegalStateException("Cannot mark in transit from " + status);
        }
        this.status = ShipmentStatus.IN_TRANSIT;
        this.updatedAt = now;
        this.pendingEvents.add(new ShipmentDomainEvent.ShipmentInTransit(
                UUID.randomUUID().toString(), OmsEventTypes.SHIPMENT_PICKED_UP, 1,
                tenantId, OmsEventTypes.AGGREGATE_SHIPMENT, shipmentId.toString(), toInstant(now),
                orderId.toString(), carrierCode));
    }

    public void markDelivered(LocalDateTime now) {
        if (status == ShipmentStatus.DELIVERED) return;
        if (status == ShipmentStatus.FAILED || status == ShipmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot mark delivered from " + status);
        }
        this.status = ShipmentStatus.DELIVERED;
        this.deliveredAt = now;
        this.updatedAt = now;
        this.pendingEvents.add(new ShipmentDomainEvent.ShipmentDelivered(
                UUID.randomUUID().toString(), OmsEventTypes.SHIPMENT_DELIVERED, 1,
                tenantId, OmsEventTypes.AGGREGATE_SHIPMENT, shipmentId.toString(), toInstant(now),
                orderId.toString(), carrierCode));
    }

    public void markFailed(String reasonCode, String reasonMessage, LocalDateTime now) {
        if (status == ShipmentStatus.DELIVERED || status == ShipmentStatus.FAILED) {
            throw new IllegalStateException("Cannot mark failed from " + status);
        }
        this.status = ShipmentStatus.FAILED;
        this.failureReasonCode = reasonCode;
        this.failureReasonMessage = reasonMessage;
        this.updatedAt = now;
        this.pendingEvents.add(new ShipmentDomainEvent.ShipmentFailed(
                UUID.randomUUID().toString(), OmsEventTypes.SHIPMENT_FAILED, 1,
                tenantId, OmsEventTypes.AGGREGATE_SHIPMENT, shipmentId.toString(), toInstant(now),
                orderId.toString(), carrierCode, reasonCode, reasonMessage));
    }

    // ── Drain ──

    public List<ShipmentDomainEvent> drainEvents() {
        var drained = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return drained;
    }

    // ── Getters ──

    public UUID getShipmentId() { return shipmentId; }
    public String getTenantId() { return tenantId; }
    public UUID getOrderId() { return orderId; }
    public String getCarrierCode() { return carrierCode; }
    public ShipmentStatus getStatus() { return status; }
    public String getTrackingNumber() { return trackingNumber; }
    public String getLabelUrl() { return labelUrl; }
    public String getFailureReasonCode() { return failureReasonCode; }
    public String getFailureReasonMessage() { return failureReasonMessage; }
    public long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public LocalDateTime getPickedUpAt() { return pickedUpAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
