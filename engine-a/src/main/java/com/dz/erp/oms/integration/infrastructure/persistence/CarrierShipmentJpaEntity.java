package com.dz.erp.oms.integration.infrastructure.persistence;

import com.dz.erp.oms.integration.domain.model.ShipmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "carrier_shipments",
        schema = "oms_schema",
        indexes = {
                @Index(name = "idx_oms_shipment_tenant_status", columnList = "tenant_id,status"),
                @Index(name = "idx_oms_shipment_order_id",     columnList = "order_id"),
                @Index(name = "uq_oms_shipment_carrier_tracking",
                        columnList = "carrier_code,tracking_number", unique = true)
        })
@Getter
@Setter
@NoArgsConstructor
public class CarrierShipmentJpaEntity {

    @Id
    @Column(name = "shipment_id", nullable = false, updatable = false)
    private UUID shipmentId;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "carrier_code", nullable = false, length = 40)
    private String carrierCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private ShipmentStatus status;

    @Column(name = "tracking_number", length = 80)
    private String trackingNumber;

    @Column(name = "label_url", length = 500)
    private String labelUrl;

    @Column(name = "failure_reason_code", length = 60)
    private String failureReasonCode;

    @Column(name = "failure_reason_message", length = 500)
    private String failureReasonMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;
}
