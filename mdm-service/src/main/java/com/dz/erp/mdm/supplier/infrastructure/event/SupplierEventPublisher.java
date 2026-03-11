package com.dz.erp.mdm.supplier.infrastructure.event;
import com.dz.erp.mdm.supplier.domain.port.SupplierEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class SupplierEventPublisher implements SupplierEventPort {
    private final DomainEventPublisher pub;
    private final OutboxPort outbox;
    private final ObjectMapper json;
    @Override @SneakyThrows
    public void publish(String eventType, String aggregateId, Object event) {
        pub.publish(event);
        outbox.save("Supplier", aggregateId, eventType, json.writeValueAsString(event));
    }
}
