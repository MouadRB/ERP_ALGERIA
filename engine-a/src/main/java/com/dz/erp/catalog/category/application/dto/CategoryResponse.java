package com.dz.erp.catalog.category.application.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String tenantId,
    UUID parentId,
    String code,
    String nameFr,
    String nameAr,
    String slugFr,
    String slugAr,
    String metaTitleFr,
    String metaTitleAr,
    String tvaCategoryCode,
    Map<String, Boolean> channelConfig,
    int position,
    boolean active,
    long publishedCount,
    long maskedCount,
    long draftCount,
    List<String> productPreview,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
