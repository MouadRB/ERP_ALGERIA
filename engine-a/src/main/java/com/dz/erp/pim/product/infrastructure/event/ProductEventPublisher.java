package com.dz.erp.pim.product.infrastructure.event;

import com.dz.erp.pim.product.domain.port.ProductEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductEventPublisher implements ProductEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String et, String ai, Object ev) {
        pub.publish(ev);
        outbox.save("Product", ai, et, json.writeValueAsString(ev));
    }
}
