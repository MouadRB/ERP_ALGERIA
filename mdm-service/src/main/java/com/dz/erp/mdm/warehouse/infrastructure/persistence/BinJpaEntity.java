package com.dz.erp.mdm.warehouse.infrastructure.persistence;

import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "bins")
@Getter
@Setter
@NoArgsConstructor
public class BinJpaEntity {
    @Id
    @Column(length = 20)
    private String binCode;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 20)
    private String zone;
    @Column(length = 10)
    private String rack;
    @Column(length = 10)
    private String shelf;
    @Column(nullable = false)
    private int maxCapacity;
    @Column(nullable = false)
    private int currentOccupancy;
    @Column(nullable = false)
    private int reservedCapacity;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BinType binType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BinStatus status;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 100)
    private String updatedBy;
    private Instant updatedAt;
    @Version
    private long version;
}
