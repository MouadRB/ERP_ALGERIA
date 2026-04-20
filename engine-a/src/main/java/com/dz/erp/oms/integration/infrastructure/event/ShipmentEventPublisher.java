package com.dz.erp.oms.integration.infrastructure.event;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.integration.domain.port.ShipmentEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShipmentEventPublisher implements ShipmentEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String et, String ai, Object ev) {
        pub.publish(ev);
        outbox.save(OmsEventTypes.AGGREGATE_SHIPMENT, ai, et, json.writeValueAsString(ev));
    }
}
