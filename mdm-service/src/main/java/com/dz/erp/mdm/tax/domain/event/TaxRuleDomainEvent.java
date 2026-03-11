package com.dz.erp.mdm.tax.domain.event;
import java.math.BigDecimal;
import java.time.Instant;
public sealed interface TaxRuleDomainEvent {
    record Created(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String taxRuleCode, String categoryCode, BigDecimal taxRate, String createdBy) implements TaxRuleDomainEvent {}
    record Activated(String eventId, String eventType, int eventVersion, String tenantId,
                     String aggregateType, String aggregateId, Instant occurredAt,
                     String taxRuleCode, String categoryCode, String activatedBy) implements TaxRuleDomainEvent {}
    record Archived(String eventId, String eventType, int eventVersion, String tenantId,
                    String aggregateType, String aggregateId, Instant occurredAt,
                    String taxRuleCode, String categoryCode, String archivedBy) implements TaxRuleDomainEvent {}
    record Updated(String eventId, String eventType, int eventVersion, String tenantId,
                   String aggregateType, String aggregateId, Instant occurredAt,
                   String taxRuleCode, String updatedBy) implements TaxRuleDomainEvent {}
}
