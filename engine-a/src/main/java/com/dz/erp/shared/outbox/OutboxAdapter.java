package com.dz.erp.shared.outbox;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Saves one outbox row PER target that accepts this event type.
 *
 * Example:
 *   Event: SKU_REGISTERED
 *   Target "engine-b"         (routes: {"*": "http://..."})                       → row created ✓
 *   Target "engine-b-crm"     (routes: {"SKU_REGISTERED": "http://...", ...})     → row created ✓
 *   Target "payment-gateway"  (routes: {"ORDER_CREATED": "http://..."})           → skipped ✗
 *
 * All rows are written in the SAME transaction as the business operation.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxAdapter implements OutboxPort {

    private final OutboxJpaRepository repository;
    private final OutboxProperties properties;

    @Override
    public void save(String aggregateType, String aggregateId, String eventType, String payload) {
        var targets = properties.getTargets();

        if (targets.isEmpty()) {
            log.warn("No outbox targets configured — event {} will not be delivered", eventType);
            return;
        }

        for (var target : targets) {
            if (target.accepts(eventType)) {
                repository.save(new OutboxEventEntity(
                        aggregateType, aggregateId, eventType, payload, target.getName()));
                log.debug("Outbox entry created: {} → {} (url: {})",
                        eventType, target.getName(), target.urlFor(eventType));
            }
        }
    }
}
