package com.dz.erp.mdm.supplier.domain.event;
import java.time.Instant;
public sealed interface SupplierDomainEvent {
    record Registered(String eventId, String eventType, int eventVersion, String tenantId,
                      String aggregateType, String aggregateId, Instant occurredAt,
                      String supplierCode, String companyName, String wilayaCode, String createdBy) implements SupplierDomainEvent {}
    record Activated(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String supplierCode, String activatedBy) implements SupplierDomainEvent {}
    record Suspended(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String supplierCode, String suspendedBy) implements SupplierDomainEvent {}
    record Reactivated(String eventId, String eventType, int eventVersion, String tenantId,
                       String aggregateType, String aggregateId, Instant occurredAt,
                       String supplierCode, String reactivatedBy) implements SupplierDomainEvent {}
    record Blacklisted(String eventId, String eventType, int eventVersion, String tenantId,
                       String aggregateType, String aggregateId, Instant occurredAt,
                       String supplierCode, String blacklistedBy) implements SupplierDomainEvent {}
    record Updated(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String supplierCode, String updatedBy) implements SupplierDomainEvent {}
}
