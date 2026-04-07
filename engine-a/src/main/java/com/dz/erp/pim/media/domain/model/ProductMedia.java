package com.dz.erp.pim.media.domain.model;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class ProductMedia {
    private final String mediaId;
    private final String productId;
    private final String tenantId;
    private String fileName;
    private String fileUrl;
    private long fileSizeBytes;
    private String mimeType;
    private MediaType mediaType;
    private MediaStatus status;
    private final Instant createdAt;

    public ProductMedia(String productId, String tenantId, String fileName, String fileUrl, long fileSizeBytes, String mimeType, MediaType mediaType) {
        this.mediaId = UUID.randomUUID().toString();
        this.productId = productId;
        this.tenantId = tenantId;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileSizeBytes = fileSizeBytes;
        this.mimeType = mimeType;
        this.mediaType = mediaType;
        this.status = MediaStatus.PENDING;
        this.createdAt = Instant.now();
    }
}
