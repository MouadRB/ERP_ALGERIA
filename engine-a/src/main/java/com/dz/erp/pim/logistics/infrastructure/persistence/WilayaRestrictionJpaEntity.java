package com.dz.erp.pim.logistics.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "wilaya_restrictions", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class WilayaRestrictionJpaEntity {
    @Id
    @Column(length = 36)
    private String restrictionId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 2)
    private String wilayaCode;
    @Column(length = 200)
    private String reason;
    @Column(nullable = false)
    private Instant restrictedAt;
    @Column(nullable = false, length = 100)
    private String restrictedBy;
}
