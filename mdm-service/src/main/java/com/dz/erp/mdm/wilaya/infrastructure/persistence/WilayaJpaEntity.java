package com.dz.erp.mdm.wilaya.infrastructure.persistence;

import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "wilayas")
@Getter
@Setter
@NoArgsConstructor
public class WilayaJpaEntity {
    @Id
    @Column(length = 2)
    private String wilayaCode;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(length = 100)
    private String nameAr;
    @Column(length = 20)
    private String zone;
    @Column(nullable = false)
    private int deliveryCostDzd;
    @Column(length = 10)
    private String estimatedDays;
    @Column(nullable = false)
    private boolean deliverable;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WilayaStatus status;
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
