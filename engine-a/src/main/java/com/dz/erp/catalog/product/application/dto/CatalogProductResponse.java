package com.dz.erp.catalog.product.application.dto;
import com.dz.erp.catalog.shared.domain.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
public record CatalogProductResponse(
    UUID id, String skuCode, UUID categoryId, String tenantId,
    PublicationStatus status, MaskedReason maskedReason,
    Set<ChannelType> activeChannels, Set<VisibilityRule> activeRules,
    LocalDateTime scheduledAt, LocalDateTime autoUnpublishAt,
    boolean featuredHomepage, boolean badgeStockLimit, int stockLimitThreshold,
    boolean includeInSponsoredSearch, BigDecimal visibilityScore,
    LocalDateTime createdAt, LocalDateTime updatedAt) {}
