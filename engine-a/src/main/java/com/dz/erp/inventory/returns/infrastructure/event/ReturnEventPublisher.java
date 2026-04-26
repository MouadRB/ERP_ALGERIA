package com.dz.erp.inventory.returns.infrastructure.event;

import com.dz.erp.inventory.returns.domain.port.ReturnEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component("inventoryReturnEventPublisher")
@RequiredArgsConstructor
public class ReturnEventPublisher implements ReturnEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String et, String ai, Object ev) {
        pub.publish(ev);
        outbox.save("ReturnInspection", ai, et, json.writeValueAsString(ev));
    }
}
