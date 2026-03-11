package com.dz.erp.mdm.tax.infrastructure.event;
import com.dz.erp.mdm.tax.domain.port.TaxRuleEventPort;
import com.dz.erp.shared.event.DomainEventPublisher;
import com.dz.erp.shared.outbox.OutboxPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor; import lombok.SneakyThrows;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class TaxRuleEventPublisher implements TaxRuleEventPort {
    private final DomainEventPublisher pub; private final OutboxPort outbox; private final ObjectMapper json;
    @Override @SneakyThrows public void publish(String eventType, String aggId, Object event) {
        pub.publish(event); outbox.save("TaxRule", aggId, eventType, json.writeValueAsString(event));
    }
}
