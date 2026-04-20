package com.dz.erp.oms.integration.infrastructure.persistence;

import com.dz.erp.oms.integration.domain.port.CarrierWebhookDedupePort;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CarrierWebhookDedupeAdapter implements CarrierWebhookDedupePort {

    private final CarrierWebhookEventSpringDataRepository repo;

    @Override
    public boolean register(String carrierCode, String eventId) {
        var entity = new CarrierWebhookEventJpaEntity();
        entity.setCarrierCode(carrierCode);
        entity.setEventId(eventId);
        entity.setReceivedAt(LocalDateTime.now());
        try {
            repo.saveAndFlush(entity);
            return true;
        } catch (DataIntegrityViolationException dup) {
            return false;
        }
    }
}
