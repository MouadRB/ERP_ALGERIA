package com.dz.erp.pim.media.application.dto;
import java.time.Instant;
public record MediaResponse(String mediaId, String productId, String fileName, String fileUrl, long fileSizeBytes, String mimeType, String mediaType, String status, Instant createdAt) {}
