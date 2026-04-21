package com.dz.erp.oms.order.infrastructure.event;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.order.domain.port.OrderEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventPublisher implements OrderEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String et, String ai, Object ev) {
        pub.publish(ev);
        outbox.save(OmsEventTypes.AGGREGATE_ORDER, ai, et, json.writeValueAsString(ev));
    }
}
