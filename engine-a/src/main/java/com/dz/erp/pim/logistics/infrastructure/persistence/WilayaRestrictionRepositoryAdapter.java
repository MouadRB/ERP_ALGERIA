package com.dz.erp.pim.logistics.infrastructure.persistence;

import com.dz.erp.pim.logistics.domain.model.WilayaRestriction;
import com.dz.erp.pim.logistics.domain.port.WilayaRestrictionRepository;
import com.dz.erp.pim.logistics.infrastructure.mapper.WilayaRestrictionPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WilayaRestrictionRepositoryAdapter implements WilayaRestrictionRepository {

    private final WilayaRestrictionSpringDataRepository jpa;
    private final WilayaRestrictionPersistenceMapper mapper;

    @Override
    public WilayaRestriction save(WilayaRestriction restriction) {
        return mapper.toDomain(jpa.save(mapper.toJpa(restriction)));
    }

    @Override
    public List<WilayaRestriction> findByProductId(String productId, String tenantId) {
        return jpa.findByProductIdAndTenantId(productId, tenantId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public boolean exists(String productId, String wilayaCode, String tenantId) {
        return jpa.existsByProductIdAndWilayaCodeAndTenantId(productId, wilayaCode, tenantId);
    }

    @Override
    public void delete(String productId, String wilayaCode, String tenantId) {
        jpa.deleteByProductIdAndWilayaCodeAndTenantId(productId, wilayaCode, tenantId);
    }
    @Override
    public void deleteAllByProductId(String productId, String tenantId) {
        jpa.deleteAllByProductId(productId, tenantId);
    }
}
