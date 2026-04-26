package com.dz.erp.pim.logistics.domain.event;

import java.time.Instant;

public sealed interface LogisticsDomainEvent {

    record ThresholdUpdated(
            String eventId, String eventType, int eventVersion,
            String tenantId, String aggregateType, String aggregateId, Instant occurredAt,
            String skuCode, int stockAlertThreshold, int reorderQuantity
    ) implements LogisticsDomainEvent {}
}
