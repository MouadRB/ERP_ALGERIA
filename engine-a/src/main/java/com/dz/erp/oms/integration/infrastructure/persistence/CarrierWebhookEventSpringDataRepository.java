package com.dz.erp.oms.integration.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CarrierWebhookEventSpringDataRepository
        extends JpaRepository<CarrierWebhookEventJpaEntity, CarrierWebhookEventJpaEntity.Key> {
}
