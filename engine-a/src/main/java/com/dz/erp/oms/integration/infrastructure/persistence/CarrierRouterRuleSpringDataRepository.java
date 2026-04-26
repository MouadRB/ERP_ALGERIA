package com.dz.erp.oms.integration.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CarrierRouterRuleSpringDataRepository
        extends JpaRepository<CarrierRouterRuleJpaEntity, UUID> {

    Optional<CarrierRouterRuleJpaEntity> findFirstByTenantIdAndWilayaCodeAndActiveTrueOrderByPriorityAsc(
            String tenantId, String wilayaCode);
}
