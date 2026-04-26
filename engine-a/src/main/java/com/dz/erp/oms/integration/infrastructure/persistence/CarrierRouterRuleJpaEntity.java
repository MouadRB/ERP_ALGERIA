package com.dz.erp.oms.integration.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persistent carrier routing rule — one row per (tenant, wilayaCode) pair.
 *
 * <p>Schema note: this replaces the V4 Flyway migration called for in the original
 * Stage 9 plan; with {@code spring.jpa.hibernate.ddl-auto: update} the table is
 * created on first boot.
 */
@Entity
@Table(
        name = "carrier_router_rules",
        schema = "oms_schema",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_oms_carrier_router_tenant_wilaya",
                columnNames = {"tenant_id", "wilaya_code"}),
        indexes = {
                @Index(name = "idx_oms_carrier_router_tenant", columnList = "tenant_id"),
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CarrierRouterRuleJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    /** ISO Algerian wilaya code {@code 01}..{@code 58}. */
    @Column(name = "wilaya_code", nullable = false, length = 2)
    private String wilayaCode;

    /** Target carrier code — must match a live {@code CarrierPort#carrierCode()}. */
    @Column(name = "carrier_code", nullable = false, length = 30)
    private String carrierCode;

    /** Lower = preferred when multiple rules somehow overlap in future. */
    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
