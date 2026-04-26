package com.dz.erp.catalog.product.infrastructure.event;

import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

/**
 * Publishes CatalogProduct domain events — same pattern as PIM's ProductEventPublisher:
 * 1. Fire ApplicationEvent (intra-engine: notifications, search indexing, audit)
 * 2. Write outbox row (cross-engine: Engine B delivery via OutboxPoller)
 */
@Component
@RequiredArgsConstructor
public class CatalogProductEventPublisher {

    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @SneakyThrows
    public void publish(String eventType, String aggregateId, CatalogDomainEvent event) {
        pub.publish(event);
        outbox.save("CatalogProduct", aggregateId, eventType, json.writeValueAsString(event));
    }
}
