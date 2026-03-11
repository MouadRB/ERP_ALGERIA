package com.dz.erp.mdm.warehouse.domain.event;
import java.time.Instant;
public sealed interface BinDomainEvent {
    record Created(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String binCode, String zone, String binType, String createdBy) implements BinDomainEvent {}
    record Activated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String binCode, String activatedBy) implements BinDomainEvent {}
    record Deactivated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String binCode, String deactivatedBy) implements BinDomainEvent {}
    record Reactivated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String binCode, String reactivatedBy) implements BinDomainEvent {}
    record Updated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String binCode, String updatedBy) implements BinDomainEvent {}
}
