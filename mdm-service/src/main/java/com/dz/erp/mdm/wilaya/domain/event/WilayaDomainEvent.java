package com.dz.erp.mdm.wilaya.domain.event;
import java.time.Instant;
public sealed interface WilayaDomainEvent {
    record Created(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String wilayaCode, String name, String zone, String createdBy) implements WilayaDomainEvent {}
    record Activated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String wilayaCode, String activatedBy) implements WilayaDomainEvent {}
    record Deactivated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String wilayaCode, String deactivatedBy) implements WilayaDomainEvent {}
    record Reactivated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String wilayaCode, String reactivatedBy) implements WilayaDomainEvent {}
    record Updated(String eventId, String eventType, int eventVersion, String tenantId, String aggregateType, String aggregateId, Instant occurredAt, String wilayaCode, String updatedBy) implements WilayaDomainEvent {}
}
