package com.dz.erp.catalog.category.infrastructure.event;

import com.dz.erp.catalog.category.domain.event.CatalogCategoryDomainEvent;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Publishes category domain events — same pattern as PIM's ProductEventPublisher:
 * 1. ApplicationEvent (intra-engine — notifications, search, cache, audit)
 * 2. Outbox row (cross-engine — Engine B delivery via OutboxPoller)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryEventPublisher {

    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @SneakyThrows
    public void publish(String eventType, String aggregateId, CatalogCategoryDomainEvent event) {
        pub.publish(event);
        outbox.save("Category", aggregateId, eventType, json.writeValueAsString(event));
        log.debug("Category event published: {} for {}", eventType, aggregateId);
    }
}
