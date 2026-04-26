package com.dz.erp.catalog.channel.application.dto;

import com.dz.erp.catalog.channel.domain.model.SalesChannelRules;
import com.dz.erp.catalog.shared.domain.ChannelType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a SalesChannel — includes per-channel product counts.
 */
public record SalesChannelResponse(
        UUID id,
        ChannelType channelType,
        boolean active,
        SalesChannelRules rules,
        int syncFrequencyMinutes,
        String catalogId,
        LocalDateTime lastSyncAt,
        long publishedCount,
        long maskedCount,
        long scheduledCount
) {}
