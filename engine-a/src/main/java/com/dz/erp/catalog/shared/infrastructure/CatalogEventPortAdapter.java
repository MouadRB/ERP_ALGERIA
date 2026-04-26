package com.dz.erp.catalog.shared.infrastructure;

import com.dz.erp.catalog.shared.domain.CatalogEventPort;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

/**
 * Infrastructure implementation of CatalogEventPort.
 * Same pattern as PIM's ProductEventPublisher outbox integration:
 * serializes the event payload to JSON and writes to the shared outbox table.
 */
@Component
@RequiredArgsConstructor
public class CatalogEventPortAdapter implements CatalogEventPort {

    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String eventType, String aggregateId, Object eventPayload) {
        outbox.save("Catalog", aggregateId, eventType, json.writeValueAsString(eventPayload));
    }
}
