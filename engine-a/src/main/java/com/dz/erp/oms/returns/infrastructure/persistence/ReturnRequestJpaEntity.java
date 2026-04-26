package com.dz.erp.oms.returns.infrastructure.persistence;

import com.dz.erp.oms.returns.domain.model.ReturnStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "return_requests",
        schema = "oms_schema",
        indexes = {
                @Index(name = "idx_oms_return_tenant_status", columnList = "tenant_id,status"),
                @Index(name = "idx_oms_return_order_id",      columnList = "order_id")
        })
@Getter
@Setter
@NoArgsConstructor
public class ReturnRequestJpaEntity {

    @Id
    @Column(name = "return_id", nullable = false, updatable = false)
    private UUID returnId;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "reason_code", length = 60)
    private String reasonCode;

    @Column(name = "reason_message", length = 500)
    private String reasonMessage;

    @Column(name = "requested_by", length = 60)
    private String requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    private ReturnStatus status;

    @Column(name = "carrier_code", length = 40)
    private String carrierCode;

    @Column(name = "inspection_id", length = 80)
    private String inspectionId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "pickup_arranged_at")
    private LocalDateTime pickupArrangedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ReturnLineJpaEntity> lines = new ArrayList<>();
}
