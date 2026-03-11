package com.dz.erp.mdm.warehouse.infrastructure.event;
import com.dz.erp.mdm.warehouse.domain.port.BinEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor; import lombok.SneakyThrows;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class BinEventPublisher implements BinEventPort {
    private final DomainEventPublisher pub; private final OutboxPort outbox; private final ObjectMapper json;
    @Override @SneakyThrows public void publish(String et, String ai, Object ev) { pub.publish(ev); outbox.save("BinLocation", ai, et, json.writeValueAsString(ev)); }
}
