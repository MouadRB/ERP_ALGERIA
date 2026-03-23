package com.dz.erp.pim.audit.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "audit_journal", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class AuditEntryJpaEntity {
    @Id
    @Column(length = 36)
    private String auditId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 50)
    private String action;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false, length = 100)
    private String actorId;
    @Column(length = 100)
    private String actorName;
    @Column(nullable = false)
    private Instant occurredAt;
    @Column(length = 64)
    private String previousHash;
    @Column(nullable = false, length = 64)
    private String currentHash;
}
