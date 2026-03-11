package com.dz.erp.mdm.sku.infrastructure.event;

import com.dz.erp.mdm.sku.domain.port.SkuEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SkuEventPublisher implements SkuEventPort {
    private final DomainEventPublisher internalPublisher;
    private final OutboxPort outboxPort;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String eventType, String aggregateId, Object event) {
        internalPublisher.publish(event);
        outboxPort.save("Sku", aggregateId, eventType, json.writeValueAsString(event));
    }
}
