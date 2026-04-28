package com.dz.erp.pim.ocr.infrastructure.persistence;

import com.dz.erp.pim.ocr.domain.model.OcrJobStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ocr_jobs", schema = "pim_schema",
        indexes = {
                @Index(name = "idx_ocr_jobs_tenant_status", columnList = "tenantId,status"),
                @Index(name = "idx_ocr_jobs_tenant_created", columnList = "tenantId,createdAt")
        })
@Getter
@Setter
@NoArgsConstructor
public class OcrJobJpaEntity {
    @Id
    @Column(length = 36)
    private String jobId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(length = 200)
    private String fileName;
    @Column(length = 100)
    private String mimeType;
    private long fileSizeBytes;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OcrJobStatus status;
    @Column(nullable = false)
    private int progressPercent;
    @Column(length = 1000)
    private String errorMessage;
    @Column(columnDefinition = "TEXT")
    private String rawJson;
    @Column(nullable = false, length = 50)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    private Instant completedAt;
}
