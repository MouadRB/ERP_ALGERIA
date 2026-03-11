package com.dz.erp.shared.outbox;

/**
 * Port for saving events to the outbox.
 * Implementation creates one row per target that accepts the event type.
 */
public interface OutboxPort {
    void save(String aggregateType, String aggregateId, String eventType, String payload);
}
