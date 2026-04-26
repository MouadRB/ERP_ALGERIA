package com.dz.erp.inventory.returns.infrastructure.persistence;

import com.dz.erp.inventory.returns.domain.model.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "return_inspections", schema = "inventory_schema")
@Getter
@Setter
@NoArgsConstructor
public class ReturnInspectionJpaEntity {
    @Id
    @Column(length = 36)
    private String inspectionId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 36)
    private String stockRecordId;
    @Column(nullable = false, length = 50)
    private String skuCode;
    @Column(nullable = false, length = 50)
    private String orderId;
    @Column(length = 100)
    private String customerRef;
    @Column(nullable = false)
    private Instant returnDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReturnReason returnReason;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCondition productCondition;
    @Column(nullable = false)
    private int quantity;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InspectionStatus inspectionStatus;
    @Column(length = 100)
    private String inspectorId;
    private Instant inspectedAt;
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Disposition disposition;
    @Column(length = 36)
    private String fifoLayerId;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Version
    private long version;
}
