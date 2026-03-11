package com.dz.erp.shared.outbox;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@NoArgsConstructor
public class OutboxEventEntity {

    @Id
    private UUID id;
    @Column(nullable = false)
    private UUID eventId;
    @Column(nullable = false, length = 100)
    private String aggregateType;
    @Column(nullable = false)
    private String aggregateId;
    @Column(nullable = false, length = 100)
    private String eventType;
    @Column(nullable = false)
    private int eventVersion;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String payload;
    @Column(nullable = false, length = 100)
    private String targetName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private OutboxStatus status;
    @Column(nullable = false)
    private int retryCount;
    private Instant nextRetryAt;
    @Column(columnDefinition = "TEXT")
    private String lastError;
    @Column(nullable = false)
    private Instant createdAt;
    private Instant publishedAt;

    public OutboxEventEntity(String aggregateType, String aggregateId,
                             String eventType, String payload, String targetName) {
        this.id = UUID.randomUUID();
        this.eventId = UUID.randomUUID();
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.eventVersion = 1;
        this.tenantId = "default";
        this.payload = payload;
        this.targetName = targetName;
        this.status = OutboxStatus.NEW;
        this.retryCount = 0;
        this.createdAt = Instant.now();
        this.nextRetryAt = Instant.now();
    }

    public void markSent() {
        this.status = OutboxStatus.SENT;
        this.publishedAt = Instant.now();
    }

    public void markFailed(String error, int maxRetries) {
        this.retryCount++;
        this.lastError = error;
        if (this.retryCount >= maxRetries) {
            this.status = OutboxStatus.DEAD;
        } else {
            this.status = OutboxStatus.FAILED;
            this.nextRetryAt = calculateNextRetry(this.retryCount);
        }
    }

    private Instant calculateNextRetry(int attempt) {
        long[] delays = {5, 30, 120, 600, 1800};
        int index = Math.min(attempt - 1, delays.length - 1);
        return Instant.now().plusSeconds(delays[index]);
    }
}
