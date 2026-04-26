package com.dz.erp.catalog.product.domain.event;

import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.MaskedReason;
import com.dz.erp.catalog.shared.domain.VisibilityRule;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public sealed interface CatalogDomainEvent {

    record ProductPublished(String skuCode, Set<ChannelType> channels,
                            String actorId, String tenantId) implements CatalogDomainEvent {
    }

    record ProductMaskedAuto(String skuCode, MaskedReason reason,
                             Set<ChannelType> channels, String tenantId) implements CatalogDomainEvent {
    }

    record ProductMaskedManual(String skuCode, String actorId,
                               String tenantId) implements CatalogDomainEvent {
    }

    record ProductScheduled(String skuCode, LocalDateTime scheduledAt,
                            String tenantId) implements CatalogDomainEvent {
    }

    record ScheduleCancelled(String skuCode, String actorId,
                             String tenantId) implements CatalogDomainEvent {
    }

    record ProductDiscontinuedInCatalog(String skuCode,
                                        String tenantId) implements CatalogDomainEvent {
    }

    record ChannelChanged(String skuCode, ChannelType channel, boolean enabled,
                          String tenantId) implements CatalogDomainEvent {
    }

    record RuleToggled(String skuCode, VisibilityRule rule, boolean enabled,
                       String tenantId) implements CatalogDomainEvent {
    }

    record CategoryAssigned(String skuCode, UUID categoryId,
                            String tenantId) implements CatalogDomainEvent {
    }
}
