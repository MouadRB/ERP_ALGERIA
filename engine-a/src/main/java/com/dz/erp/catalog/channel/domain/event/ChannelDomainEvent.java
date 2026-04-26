package com.dz.erp.catalog.channel.domain.event;

import com.dz.erp.catalog.channel.domain.model.SalesChannelRules;
import com.dz.erp.catalog.shared.domain.ChannelType;

import java.time.LocalDateTime;

/**
 * Sealed interface for all SalesChannel domain events.
 * Consumed by: CatalogAuditService (audit log), CacheEvictionService (Redis).
 */
public sealed interface ChannelDomainEvent {

    String tenantId();

    ChannelType channelType();

    record ChannelRulesUpdated(
            ChannelType channelType,
            SalesChannelRules previousRules,
            SalesChannelRules newRules,
            String actorId,
            String tenantId
    ) implements ChannelDomainEvent {}

    record SyncCompleted(
            ChannelType channelType,
            int syncedCount,
            int excludedCount,
            int errorCount,
            long durationMs,
            String tenantId
    ) implements ChannelDomainEvent {}

    record ChannelActivated(
            ChannelType channelType,
            String actorId,
            String tenantId
    ) implements ChannelDomainEvent {}

    record ChannelDeactivated(
            ChannelType channelType,
            String actorId,
            String tenantId
    ) implements ChannelDomainEvent {}
}
