package com.dz.erp.catalog.channel.infrastructure.event;

import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;
import com.dz.erp.catalog.channel.domain.port.ChannelEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Publishes channel domain events — same pattern as PIM's ProductEventPublisher:
 * 1. ApplicationEvent (intra-engine: notifications, audit listener, cache eviction)
 * 2. Outbox row (cross-engine: Engine B delivery via OutboxPoller)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChannelEventPublisher implements ChannelEventPort {

    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String eventType, String aggregateId, ChannelDomainEvent event) {
        pub.publish(event);
        outbox.save("SalesChannel", aggregateId, eventType, json.writeValueAsString(event));
        log.debug("Published channel event: {} for {}", eventType, aggregateId);
    }
}
