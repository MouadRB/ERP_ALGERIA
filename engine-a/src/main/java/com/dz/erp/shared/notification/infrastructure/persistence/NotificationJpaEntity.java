package com.dz.erp.shared.notification.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "notifications", schema = "shared_schema")
@Getter
@Setter
@NoArgsConstructor
public class NotificationJpaEntity {
    @Id
    @Column(length = 36)
    private String notificationId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 50)
    private String targetRole;
    @Column(nullable = false, length = 30)
    private String module;
    @Column(nullable = false, length = 80)
    private String eventType;
    @Column(nullable = false, length = 120)
    private String titleKey;
    @Column(nullable = false, length = 120)
    private String bodyKey;
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> params;
    @Column(length = 50)
    private String referenceId;
    @Column(length = 30)
    private String referenceType;
    @Column(nullable = false)
    private boolean read;
    @Column(nullable = false)
    private Instant occurredAt;
}
