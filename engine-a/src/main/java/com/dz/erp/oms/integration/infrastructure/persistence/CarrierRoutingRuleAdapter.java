package com.dz.erp.oms.integration.infrastructure.persistence;

import com.dz.erp.oms.integration.domain.port.CarrierRoutingPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CarrierRoutingRuleAdapter implements CarrierRoutingPort {

    private final CarrierRouterRuleSpringDataRepository repo;

    @Override
    public Optional<String> resolveCarrierCode(String tenantId, String wilayaCode) {
        if (tenantId == null || wilayaCode == null) return Optional.empty();
        return repo.findFirstByTenantIdAndWilayaCodeAndActiveTrueOrderByPriorityAsc(tenantId, wilayaCode)
                .map(CarrierRouterRuleJpaEntity::getCarrierCode);
    }
}
