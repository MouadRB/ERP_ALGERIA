package com.dz.erp.oms.returns.infrastructure.event;

import com.dz.erp.oms.common.OmsEventTypes;
import com.dz.erp.oms.returns.domain.port.ReturnEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

@Component("omsReturnEventPublisher")
@RequiredArgsConstructor
public class ReturnEventPublisher implements ReturnEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;

    @Override
    @SneakyThrows
    public void publish(String et, String ai, Object ev) {
        pub.publish(ev);
        outbox.save(OmsEventTypes.AGGREGATE_RETURN, ai, et, json.writeValueAsString(ev));
    }
}
