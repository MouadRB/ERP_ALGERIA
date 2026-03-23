package com.dz.erp.pim.media.infrastructure.persistence;

import com.dz.erp.pim.media.domain.model.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "product_media", schema = "pim_schema")
@Getter
@Setter
@NoArgsConstructor
public class ProductMediaJpaEntity {
    @Id
    @Column(length = 36)
    private String mediaId;
    @Column(nullable = false, length = 36)
    private String productId;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 200)
    private String fileName;
    @Column(nullable = false, length = 500)
    private String fileUrl;
    private long fileSizeBytes;
    @Column(length = 50)
    private String mimeType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType mediaType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaStatus status;
    private int sortOrder;
    @Column(nullable = false)
    private Instant createdAt;
}
